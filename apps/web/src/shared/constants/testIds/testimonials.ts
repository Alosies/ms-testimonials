export const testimonialsTestIds = {
  // Testimonials list page
  testimonialsList: 'testimonials-list',
  testimonialsTable: 'testimonials-table',
  testimonialsTableRow: 'testimonials-table-row',
  testimonialsEmptyState: 'testimonials-empty-state',

  // Filter tabs
  filterTabs: 'testimonials-filter-tabs',
  filterTab: 'testimonials-filter-tab',

  // Search
  searchInput: 'testimonials-search-input',

  // Detail panel
  detailPanel: 'testimonials-detail-panel',
  detailCustomerName: 'testimonials-detail-customer-name',
  detailContent: 'testimonials-detail-content',
  detailStatus: 'testimonials-detail-status',

  // Actions
  approveButton: 'testimonials-approve-button',
  rejectButton: 'testimonials-reject-button',

  // Row elements
  rowCustomerName: 'testimonials-row-customer-name',

  // Skeleton
  tableSkeleton: 'testimonials-table-skeleton',
} as const;

export type TestimonialsTestId = typeof testimonialsTestIds;
