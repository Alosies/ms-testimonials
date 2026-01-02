import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { GetFormsQuery } from '@/shared/graphql/generated/operations'

type FormItem = GetFormsQuery['forms'][number]
type SortColumn = 'name' | 'product' | 'status' | 'updated'
type SortDirection = 'asc' | 'desc'

export interface FormsTableState {
  searchQuery: Ref<string>
  sortColumn: Ref<SortColumn>
  sortDirection: Ref<SortDirection>
  filteredAndSortedForms: ComputedRef<FormItem[]>
  hasFilteredForms: ComputedRef<boolean>
  isSearching: ComputedRef<boolean>
  toggleSort: (column: SortColumn) => void
  clearSearch: () => void
}

/**
 * Composable for managing forms table search and sort state
 */
export function useFormsTableState(forms: Ref<FormItem[]>): FormsTableState {
  const searchQuery = ref('')
  const sortColumn = ref<SortColumn>('updated')
  const sortDirection = ref<SortDirection>('desc')

  const toggleSort = (column: SortColumn): void => {
    if (sortColumn.value === column) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortColumn.value = column
      sortDirection.value = 'asc'
    }
  }

  const clearSearch = (): void => {
    searchQuery.value = ''
  }

  const filteredAndSortedForms = computed((): FormItem[] => {
    let result = [...forms.value]

    // Filter by search query
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      result = result.filter(
        (form) =>
          form.name.toLowerCase().includes(query) ||
          (form.product_name?.toLowerCase().includes(query) ?? false)
      )
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0

      switch (sortColumn.value) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'product':
          comparison = (a.product_name ?? '').localeCompare(b.product_name ?? '')
          break
        case 'status': {
          const getStatusOrder = (form: FormItem): number => {
            if (form.status === 'draft') return 0
            if (!form.is_active) return 1
            return 2
          }
          comparison = getStatusOrder(a) - getStatusOrder(b)
          break
        }
        case 'updated':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          break
      }

      return sortDirection.value === 'asc' ? comparison : -comparison
    })

    return result
  })

  const hasFilteredForms = computed(() => filteredAndSortedForms.value.length > 0)
  const isSearching = computed(() => searchQuery.value.trim().length > 0)

  return {
    searchQuery,
    sortColumn,
    sortDirection,
    filteredAndSortedForms,
    hasFilteredForms,
    isSearching,
    toggleSort,
    clearSearch,
  }
}
