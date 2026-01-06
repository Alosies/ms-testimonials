-- =====================================================
-- Add flow_id column to form_steps
-- =====================================================
-- Purpose: Link form steps to the flows table for proper branching support.
--          This is Phase 2 of the flows migration strategy per ADR-009.
--
-- Migration Strategy:
--   Phase 1: ✅ Create flows table
--   Phase 2: (This migration) Add flow_id as nullable column
--   Phase 3: Backfill existing data - create flows for existing forms
--   Phase 4: Make flow_id NOT NULL and add foreign key constraint
--
-- Dependencies: flows table must exist

-- =========================================================================
-- Add Column
-- =========================================================================

-- Add flow_id column (nullable initially for backfill)
-- After backfill migration, this will be made NOT NULL
ALTER TABLE public.form_steps
ADD COLUMN flow_id TEXT;

-- =========================================================================
-- Indexes
-- =========================================================================

-- Index for querying steps by flow (primary access pattern in editor)
CREATE INDEX idx_form_steps_flow_id ON public.form_steps(flow_id);

-- Composite index for ordered retrieval within a flow
-- Used by: ORDER BY flow_id, step_order
CREATE INDEX idx_form_steps_flow_order ON public.form_steps(flow_id, step_order);

-- =========================================================================
-- Documentation
-- =========================================================================

COMMENT ON COLUMN public.form_steps.flow_id IS
  'Foreign key to flows table. Links step to its parent flow (shared, testimonial, or improvement). Will be NOT NULL after backfill migration.';
