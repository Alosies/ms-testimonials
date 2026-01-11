# ADR-009: Playwright Browser Testing Plan

## Overview

Comprehensive end-to-end testing plan for the Flows Table Branching Architecture feature using Playwright MCP tools.

**Test Environment:**
- URL: `https://app.testimonial.brownforge.com`
- Browser: Chromium via Playwright MCP
- Test Data: Forms created during test execution

---

## Test Categories

### 1. Branching Enable/Disable

| Test ID | Test Name | Priority |
|---------|-----------|----------|
| BE-001 | Enable branching on rating step | Critical |
| BE-002 | Threshold selector displays when branching enabled | Critical |
| BE-003 | Change branching threshold | High |
| BE-004 | Disable branching - keep testimonial steps | Critical |
| BE-005 | Disable branching - keep improvement steps | Critical |
| BE-006 | Disable branching - delete all branched steps | Critical |
| BE-007 | Cancel disable branching modal | High |
| BE-008 | Branching toggle state persists after page refresh | High |

### 2. Branch Point Deletion Protection

| Test ID | Test Name | Priority |
|---------|-----------|----------|
| DP-001 | Cannot delete branch point step when branching enabled | Critical |
| DP-002 | Deletion protection modal shows correct message | Critical |
| DP-003 | "Got it" button closes modal and step remains | High |
| DP-004 | Can delete branch point after disabling branching | High |

### 3. Flow Management

| Test ID | Test Name | Priority |
|---------|-----------|----------|
| FM-001 | Add step to testimonial flow | Critical |
| FM-002 | Add step to improvement flow | Critical |
| FM-003 | Flow focus syncs when selecting branched step | High |
| FM-004 | Sidebar shows correct step counts per flow | High |
| FM-005 | Flow cards expand/collapse | Medium |

### 4. Step Operations

| Test ID | Test Name | Priority |
|---------|-----------|----------|
| SO-001 | Add step before branch point | High |
| SO-002 | Add step after branched steps | High |
| SO-003 | Reorder steps within flow | Medium |
| SO-004 | Delete non-branch-point step | High |
| SO-005 | Duplicate step within flow | Medium |

### 5. Form Preview/Submission Flow

| Test ID | Test Name | Priority |
|---------|-----------|----------|
| FP-001 | Rating >= threshold shows testimonial flow | Critical |
| FP-002 | Rating < threshold shows improvement flow | Critical |
| FP-003 | Shared steps always display | Critical |
| FP-004 | Correct step sequence in preview | High |

### 6. Edge Cases

| Test ID | Test Name | Priority |
|---------|-----------|----------|
| EC-001 | Branching settings hidden for non-rating steps | High |
| EC-002 | Enable branching with no rating step selected | Medium |
| EC-003 | Change threshold with existing branched steps | Medium |
| EC-004 | Multiple forms with different branching configs | Low |

---

## Detailed Test Cases

### BE-001: Enable Branching on Rating Step

**Preconditions:**
- User is logged in
- Form with rating step exists

**Steps:**
1. Navigate to form studio
2. Select rating step from sidebar
3. Locate "Branching Settings" panel in properties
4. Toggle "Enable branching" switch ON
5. Verify threshold selector appears
6. Verify flow metadata appears (testimonial/improvement icons)

**Expected Result:**
- Toggle shows enabled state
- Threshold dropdown visible with default value "4 stars"
- Visual indicators show flow split
- Timeline updates to show branching structure

**Playwright Actions:**
```typescript
// Navigate to form studio
await mcp__playwright-yellow__browser_navigate({ url: 'https://app.testimonial.brownforge.com/studio/forms/{formId}' });
await mcp__playwright-yellow__browser_snapshot();

// Select rating step
await mcp__playwright-yellow__browser_click({ element: 'Rating step in sidebar', ref: '{rating-step-ref}' });
await mcp__playwright-yellow__browser_snapshot();

// Enable branching toggle
await mcp__playwright-yellow__browser_click({ element: 'Enable branching switch', ref: '{switch-ref}' });
await mcp__playwright-yellow__browser_snapshot();

// Verify threshold selector appears
// Assert threshold dropdown is visible
// Assert flow metadata icons appear
```

---

### BE-004: Disable Branching - Keep Testimonial Steps

**Preconditions:**
- Form with branching enabled
- Both testimonial and improvement flows have steps

**Steps:**
1. Navigate to form studio
2. Select branch point (rating step)
3. Toggle "Enable branching" OFF
4. Verify modal appears with 3 options
5. Click "Keep Testimonial Steps" option
6. Verify modal closes
7. Verify testimonial steps remain in shared flow
8. Verify improvement steps are deleted

**Expected Result:**
- Modal shows with warning icon
- Three options displayed: Keep Testimonial, Keep Improvement, Delete All
- Cancel button available
- After selection, steps reorganize correctly
- Branching toggle shows disabled state

**Playwright Actions:**
```typescript
// Navigate and select rating step
await mcp__playwright-yellow__browser_navigate({ url: '...' });
await mcp__playwright-yellow__browser_click({ element: 'Rating step', ref: '...' });
await mcp__playwright-yellow__browser_snapshot();

// Toggle branching off
await mcp__playwright-yellow__browser_click({ element: 'Enable branching switch', ref: '...' });
await mcp__playwright-yellow__browser_snapshot();

// Verify modal appears
// Assert modal title: "Disable Branching"
// Assert 3 options visible

// Click Keep Testimonial
await mcp__playwright-yellow__browser_click({ element: 'Keep Testimonial Steps button', ref: '...' });
await mcp__playwright-yellow__browser_snapshot();

// Verify results
// Assert toggle is OFF
// Assert testimonial steps still exist
// Assert improvement steps removed
```

---

### DP-001: Cannot Delete Branch Point Step

**Preconditions:**
- Form with branching enabled
- Rating step is the branch point

**Steps:**
1. Navigate to form studio
2. Enable branching on rating step
3. Add at least one step to testimonial flow
4. Select rating step
5. Click delete button
6. Verify protection modal appears
7. Click "Got it" button
8. Verify step is NOT deleted

**Expected Result:**
- Modal with blue info styling appears
- Title: "Cannot Delete Step"
- Message explains step is used for branching
- Single "Got it" button (not Cancel + Confirm)
- Step remains after closing modal

**Playwright Actions:**
```typescript
// Setup branching
await mcp__playwright-yellow__browser_navigate({ url: '...' });
await mcp__playwright-yellow__browser_click({ element: 'Rating step', ref: '...' });
await mcp__playwright-yellow__browser_click({ element: 'Enable branching switch', ref: '...' });
await mcp__playwright-yellow__browser_snapshot();

// Try to delete branch point
await mcp__playwright-yellow__browser_click({ element: 'Delete step button', ref: '...' });
await mcp__playwright-yellow__browser_snapshot();

// Verify protection modal
// Assert modal title: "Cannot Delete Step"
// Assert blue info icon
// Assert single button: "Got it"

// Close modal
await mcp__playwright-yellow__browser_click({ element: 'Got it button', ref: '...' });
await mcp__playwright-yellow__browser_snapshot();

// Verify step still exists
// Assert rating step visible in sidebar
```

---

### FM-001: Add Step to Testimonial Flow

**Preconditions:**
- Form with branching enabled
- Testimonial flow is expanded

**Steps:**
1. Navigate to form studio
2. Enable branching
3. Click "Add Step" in testimonial flow section
4. Select step type (e.g., Short Answer)
5. Verify step appears in testimonial flow
6. Verify step count updates in sidebar

**Expected Result:**
- New step added to correct flow
- Step shows testimonial flow visual indicator (green accent)
- Sidebar step count increments
- Step is selected after creation

**Playwright Actions:**
```typescript
// Enable branching and expand testimonial flow
await mcp__playwright-yellow__browser_navigate({ url: '...' });
// ... enable branching ...

// Add step to testimonial flow
await mcp__playwright-yellow__browser_click({ element: 'Add step to Testimonial flow', ref: '...' });
await mcp__playwright-yellow__browser_snapshot();

// Select step type
await mcp__playwright-yellow__browser_click({ element: 'Short Answer step type', ref: '...' });
await mcp__playwright-yellow__browser_snapshot();

// Verify step in correct flow
// Assert new step has testimonial flow membership
// Assert sidebar count updated
```

---

### FP-001: Rating >= Threshold Shows Testimonial Flow

**Preconditions:**
- Form with branching enabled (threshold = 4)
- Testimonial flow has specific steps
- Improvement flow has different steps

**Steps:**
1. Navigate to form preview
2. Complete shared steps (welcome, rating)
3. Select rating of 4 or 5 stars
4. Submit rating step
5. Verify testimonial flow steps appear
6. Verify improvement flow steps do NOT appear

**Expected Result:**
- Rating submission triggers flow evaluation
- Only testimonial-specific steps shown
- Improvement-specific steps hidden
- Step progression follows correct order

**Playwright Actions:**
```typescript
// Navigate to preview
await mcp__playwright-yellow__browser_navigate({ url: '.../preview/{formId}' });
await mcp__playwright-yellow__browser_snapshot();

// Complete rating step with 5 stars
await mcp__playwright-yellow__browser_click({ element: '5 star rating', ref: '...' });
await mcp__playwright-yellow__browser_click({ element: 'Next button', ref: '...' });
await mcp__playwright-yellow__browser_snapshot();

// Verify testimonial flow
// Assert testimonial-specific question visible
// Assert improvement-specific question NOT visible

// Navigate through testimonial flow
// Assert correct step sequence
```

---

### EC-001: Branching Settings Hidden for Non-Rating Steps

**Preconditions:**
- Form with multiple step types

**Steps:**
1. Navigate to form studio
2. Select Welcome step
3. Verify Branching Settings panel is NOT visible
4. Select Short Answer step
5. Verify Branching Settings panel is NOT visible
6. Select Rating step
7. Verify Branching Settings panel IS visible

**Expected Result:**
- Branching Settings only shows for rating steps
- Other step types show their appropriate panels
- No errors when switching between steps

**Playwright Actions:**
```typescript
await mcp__playwright-yellow__browser_navigate({ url: '...' });

// Select Welcome step
await mcp__playwright-yellow__browser_click({ element: 'Welcome step', ref: '...' });
await mcp__playwright-yellow__browser_snapshot();
// Assert no "Conditional Branching" panel visible

// Select Short Answer step
await mcp__playwright-yellow__browser_click({ element: 'Short Answer step', ref: '...' });
await mcp__playwright-yellow__browser_snapshot();
// Assert no "Conditional Branching" panel visible

// Select Rating step
await mcp__playwright-yellow__browser_click({ element: 'Rating step', ref: '...' });
await mcp__playwright-yellow__browser_snapshot();
// Assert "Conditional Branching" panel visible
```

---

## Test Execution Strategy

### Phase 1: Core Branching (Critical Path)
Execute tests in order:
1. BE-001 → BE-002 → BE-003
2. DP-001 → DP-002 → DP-003
3. FP-001 → FP-002 → FP-003

### Phase 2: Flow Management
Execute tests:
1. FM-001 → FM-002 → FM-003
2. SO-001 → SO-004

### Phase 3: Disable Branching Flows
Execute tests:
1. BE-004 → Verify step state
2. BE-005 → Verify step state
3. BE-006 → Verify step state
4. BE-007 → Cancel flow

### Phase 4: Edge Cases
Execute remaining tests based on priority.

---

## Test Data Setup

### Required Forms

1. **Basic Form with Rating**
   - Welcome step (shared)
   - Rating step (branch point)
   - Thank you step (shared)

2. **Full Branching Form**
   - Welcome step (shared)
   - Rating step (branch point, threshold=4)
   - Testimonial flow: 2 steps (problem, solution)
   - Improvement flow: 2 steps (feedback, suggestions)
   - Thank you step (shared)

### Cleanup Strategy

After each test suite:
1. Delete test-created forms
2. Reset form to initial state if modified

---

## Expected Issues to Validate

### Database Constraints
- [ ] FK RESTRICT on branch_question_id prevents question deletion
- [ ] CASCADE on flow_id deletes orphan steps
- [ ] CHECK constraints enforce valid flow_type values

### UI Behavior
- [ ] Toggle state syncs with database
- [ ] Modal closes properly on all exit paths
- [ ] Step counts update in real-time
- [ ] Flow focus follows selection

### Edge Conditions
- [ ] Rapid toggle enable/disable doesn't cause state issues
- [ ] Navigation away with unsaved changes prompts user
- [ ] Concurrent edits handled gracefully

---

## Playwright MCP Notes

This project uses `playwright-yellow` MCP server for browser automation.

**Key Commands:**
```typescript
// Navigation
mcp__playwright-yellow__browser_navigate({ url: '...' })

// Capture state for assertions
mcp__playwright-yellow__browser_snapshot()

// Interactions
mcp__playwright-yellow__browser_click({ element: '...', ref: '...' })
mcp__playwright-yellow__browser_type({ element: '...', ref: '...', text: '...' })

// Wait for state
mcp__playwright-yellow__browser_wait_for({ text: '...' })
mcp__playwright-yellow__browser_wait_for({ textGone: '...' })
```

**Best Practices:**
1. Always take snapshot before interactions
2. Use descriptive element names for readability
3. Wait for network/UI to settle before assertions
4. Clean up test data after execution
