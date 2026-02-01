# Data Access Strategy: Hasura vs Drizzle

## Doc Connections
**ID**: `api-data-access-strategy`

2026-02-01 IST

**Parent ReadMes**:
- `api-development-guide` - API Development Guide

**Related ReadMes**:
- `adr-021-api-service-data-layer-architecture` - Architecture decisions
- `adr-023-ai-capabilities-plan-integration` - Credits feature implementation

---

This document provides a decision framework for choosing between Hasura GraphQL and Drizzle ORM when implementing data access in the API.

---

## Quick Reference

| Use Case | Recommendation |
|----------|----------------|
| Simple CRUD (single entity) | **Hasura GraphQL** |
| Read operations in route handlers | **Hasura GraphQL** |
| Frontend data fetching | **Hasura GraphQL** |
| Multi-table transactions | **Drizzle ORM** |
| Conditional updates (optimistic locking) | **Drizzle ORM** |
| Complex aggregations (SUM, COUNT, GROUP BY) | **Drizzle ORM** |
| Real-time subscriptions | **Hasura Subscriptions** |

---

## Decision Framework

### When to Use Hasura GraphQL

**Best for READ operations where:**

1. **Type Safety via Codegen**
   - Generated types ensure frontend/backend consistency
   - Catch type errors at compile time
   ```typescript
   import { GetCreditBalanceDocument, type GetCreditBalanceQuery }
     from '@/graphql/generated/operations';
   ```

2. **Organization Isolation (RLS)**
   - Hasura enforces row-level security automatically
   - No manual `WHERE organization_id = ?` needed
   - Reduces security bugs from missing filters

3. **Declarative Joins**
   - Relationships defined in metadata
   - Joins handled by Hasura, not in application code
   ```graphql
   query GetTransactions {
     credit_transactions {
       ai_capability { name }  # Auto-joined
       quality_level { name }  # Auto-joined
     }
   }
   ```

4. **Computed Fields**
   - Business logic in PostgreSQL functions
   - Exposed as GraphQL fields automatically
   ```yaml
   computed_fields:
     - name: available_credits
       definition:
         function: ocb_available_credits
   ```

5. **Consistency with Frontend**
   - Same GraphQL patterns used in Vue composables
   - Shared understanding of data shapes

### When to Use Drizzle ORM

**Best for WRITE operations requiring:**

1. **Multi-Table Transactions**
   - Atomic operations across multiple tables
   - ACID guarantees for data consistency
   ```typescript
   await db.transaction(async (tx) => {
     await tx.update(balances).set({ reserved_credits: sql`...` });
     await tx.insert(reservations).values({ ... });
   });
   ```

2. **Conditional Updates (Optimistic Locking)**
   - `WHERE` clauses that prevent race conditions
   - Verify state before making changes
   ```typescript
   const result = await tx.update(balances)
     .set({ reserved_credits: sql`reserved_credits + ${amount}` })
     .where(and(
       eq(balances.organizationId, orgId),
       sql`(monthly_credits + bonus_credits - reserved_credits) >= ${amount}`
     ))
     .returning();

   if (result.length === 0) {
     throw new InsufficientCreditsError();
   }
   ```

3. **Complex Aggregations**
   - SUM, COUNT, AVG with GROUP BY
   - Subqueries and CTEs
   ```typescript
   const used = await tx.execute(sql`
     SELECT SUM(ABS(credits_amount)) as total
     FROM credit_transactions
     WHERE organization_id = ${orgId}
       AND transaction_type = 'ai_consumption'
       AND created_at >= ${periodStart}
   `);
   ```

4. **Bulk Operations**
   - Batch inserts/updates
   - Performance-critical operations
   ```typescript
   await tx.insert(transactions).values(
     items.map(item => ({ ...item, organizationId }))
   );
   ```

5. **Raw SQL When Needed**
   - Complex PostgreSQL features
   - Database-specific functions

---

## Pattern Examples

### Pattern 1: Read-Only Route Handler (Use GraphQL)

```typescript
// routes/credits.ts - GET /credits/balance
const { data, error } = await executeGraphQLAsAdmin<GetCreditBalanceQuery>(
  GetCreditBalanceDocument,
  { organizationId }
);

if (error || !data) {
  return c.json({ error: 'Failed to retrieve balance' }, 500);
}

return c.json({
  monthlyCredits: data.organization_credit_balances[0].monthly_credits,
  // ...
});
```

### Pattern 2: Transactional Write (Use Drizzle)

```typescript
// operations/reserveCredits.ts
export async function reserveCredits(params: ReserveCreditParams) {
  const db = getDb();

  return db.transaction(async (tx) => {
    // Step 1: Atomically reserve credits with condition
    const balanceResult = await tx.update(organizationCreditBalances)
      .set({
        reserved_credits: sql`reserved_credits + ${params.amount}`,
        updated_at: new Date(),
      })
      .where(and(
        eq(organizationCreditBalances.organizationId, params.organizationId),
        // Ensure sufficient credits available
        sql`(monthly_credits + bonus_credits - reserved_credits -
             get_used_this_period(${params.organizationId})) >= ${params.amount}`
      ))
      .returning();

    if (balanceResult.length === 0) {
      throw new InsufficientCreditsError();
    }

    // Step 2: Create reservation record
    const reservation = await tx.insert(creditReservations)
      .values({
        organizationId: params.organizationId,
        amount: params.amount,
        // ...
      })
      .returning();

    return reservation[0];
  });
}
```

### Pattern 3: Hybrid Approach (Read GraphQL + Write Drizzle)

```typescript
// operations/checkBalance.ts
export async function checkCreditBalance(orgId: string, cost: number) {
  // READ via GraphQL - type-safe, uses RLS
  const { data } = await executeGraphQLAsAdmin<GetCreditBalanceForCheckQuery>(
    GetCreditBalanceForCheckDocument,
    { organizationId: orgId }
  );

  // Compute derived values in application layer
  const available = data.monthly_credits + data.bonus_credits - data.reserved_credits;
  const canProceed = available >= cost;

  return { canProceed, available };
}

// operations/reserveCredits.ts
export async function reserveCredits(params: ReserveCreditParams) {
  // WRITE via Drizzle - transactional, conditional
  return db.transaction(async (tx) => {
    // ... as above
  });
}
```

---

## Credits Feature: Case Study

The credits feature demonstrates the hybrid approach:

| Operation | Data Access | Reason |
|-----------|-------------|--------|
| `checkCreditBalance` | GraphQL | Read-only, benefits from codegen types |
| `GET /credits/balance` | GraphQL | Read-only route handler |
| `GET /credits/transactions` | GraphQL | Read with joins (ai_capability, quality_level) |
| `reserveCredits` | Drizzle | Transaction: balance update + reservation insert |
| `settleCredits` | Drizzle | Transaction: complex deduction split, multiple updates |
| `releaseCredits` | Drizzle | Conditional update: only release if not settled |
| `POST /credits/purchase` | Drizzle | Stripe integration with conditional customer creation |

---

## Migration Path

When adding computed fields to GraphQL:

1. **Create PostgreSQL functions** (migration)
   ```sql
   CREATE FUNCTION ocb_available_credits(row organization_credit_balances)
   RETURNS DECIMAL AS $$
   BEGIN
     RETURN public.get_available_credits(row.organization_id);
   END;
   $$ LANGUAGE plpgsql STABLE;
   ```

2. **Add to Hasura metadata**
   ```yaml
   computed_fields:
     - name: available_credits
       definition:
         function:
           name: ocb_available_credits
   ```

3. **Update GraphQL queries**
   ```graphql
   query GetCreditBalance($organizationId: String!) {
     organization_credit_balances(where: { organization_id: { _eq: $organizationId } }) {
       monthly_credits
       bonus_credits
       available_credits  # Now available as computed field
     }
   }
   ```

4. **Remove application-layer computation**
   ```typescript
   // Before: compute in app
   const available = monthly + bonus - reserved - used;

   // After: use computed field
   const available = data.available_credits;
   ```

---

## Anti-Patterns to Avoid

### 1. Using Drizzle for Simple Reads

```typescript
// BAD: Drizzle for simple read
const result = await db.select().from(forms).where(eq(forms.id, formId));

// GOOD: GraphQL with codegen types
const { data } = await executeGraphQLAsAdmin<GetFormQuery>(
  GetFormDocument,
  { formId }
);
```

### 2. Using GraphQL for Transactions

```typescript
// BAD: Multiple GraphQL mutations (no atomicity)
await executeGraphQL(UpdateBalanceDocument, { ... });
await executeGraphQL(InsertReservationDocument, { ... }); // What if this fails?

// GOOD: Drizzle transaction
await db.transaction(async (tx) => {
  await tx.update(balances).set({ ... });
  await tx.insert(reservations).values({ ... });
});
```

### 3. Missing Conditional Updates

```typescript
// BAD: Read-then-write race condition
const balance = await getBalance(orgId);
if (balance.available >= amount) {
  await updateBalance(orgId, -amount);  // Race condition!
}

// GOOD: Atomic conditional update
const result = await tx.update(balances)
  .set({ credits: sql`credits - ${amount}` })
  .where(sql`credits >= ${amount}`)
  .returning();
```

---

## Checklist

When implementing data access:

- [ ] **READ operations**: Use GraphQL for type safety and RLS
- [ ] **WRITE operations**: Consider if transaction is needed
- [ ] **Multi-table writes**: Use Drizzle transaction
- [ ] **Conditional updates**: Use Drizzle with `WHERE` clause
- [ ] **Aggregations**: Evaluate if Hasura aggregations suffice, else Drizzle
- [ ] **Document rationale**: Add comment explaining choice in complex cases
