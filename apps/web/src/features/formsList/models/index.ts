import type { GetFormsQuery } from '@/shared/graphql/generated/operations'

export type FormItem = GetFormsQuery['forms'][number]
export type SortColumn = 'name' | 'product' | 'status' | 'updated'
export type SortDirection = 'asc' | 'desc'

export type { FormsTableState } from '../composables/useFormsTableState'
