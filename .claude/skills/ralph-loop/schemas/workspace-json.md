# workspace.json Schema

Metadata file tracking agent ownership, handoffs, and workspace status.

## Schema

```json
{
  "feature": "string",
  "createdAt": "ISO 8601 timestamp",
  "createdBy": "yellow | green | blue",
  "primaryAgent": "yellow | green | blue",
  "status": "active | paused | completed | archived",
  "sourceDocument": "string (path to ADR/spec)",
  "handoffs": [
    {
      "from": "yellow | green | blue",
      "to": "yellow | green | blue",
      "at": "ISO 8601 timestamp",
      "reason": "string",
      "lastCompletedStory": "string (story ID)"
    }
  ]
}
```

## Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `feature` | string | Feature name (lowercase, hyphens) |
| `createdAt` | ISO 8601 | When workspace was created |
| `createdBy` | enum | Agent that created the workspace |
| `primaryAgent` | enum | Current owner - updated on handoffs |
| `status` | enum | Workspace lifecycle state |
| `sourceDocument` | string | Path to source ADR/spec document |
| `handoffs` | array | History of agent transfers |

### Status Values

| Status | Meaning |
|--------|---------|
| `active` | Work in progress |
| `paused` | Temporarily stopped |
| `completed` | All stories done |
| `archived` | Moved to archive |

### Handoff Record

| Field | Description |
|-------|-------------|
| `from` | Previous agent |
| `to` | New agent |
| `at` | Timestamp of handoff |
| `reason` | Why handoff occurred (e.g., "continuation") |
| `lastCompletedStory` | Last story completed before handoff |

## Example: New Workspace

```json
{
  "feature": "flows-table",
  "createdAt": "2026-01-10T08:30:00Z",
  "createdBy": "yellow",
  "primaryAgent": "yellow",
  "status": "active",
  "sourceDocument": "docs/adr/009-flows-table-branching-architecture.md",
  "handoffs": []
}
```

## Example: After Handoff

```json
{
  "feature": "flows-table",
  "createdAt": "2026-01-10T08:30:00Z",
  "createdBy": "yellow",
  "primaryAgent": "green",
  "status": "active",
  "sourceDocument": "docs/adr/009-flows-table-branching-architecture.md",
  "handoffs": [
    {
      "from": "yellow",
      "to": "green",
      "at": "2026-01-10T14:30:00Z",
      "reason": "continuation",
      "lastCompletedStory": "DB-003"
    }
  ]
}
```

## Example: Completed

```json
{
  "feature": "flows-table",
  "createdAt": "2026-01-10T08:30:00Z",
  "createdBy": "yellow",
  "primaryAgent": "green",
  "status": "completed",
  "sourceDocument": "docs/adr/009-flows-table-branching-architecture.md",
  "handoffs": [
    {
      "from": "yellow",
      "to": "green",
      "at": "2026-01-10T14:30:00Z",
      "reason": "continuation",
      "lastCompletedStory": "DB-003"
    }
  ]
}
```
