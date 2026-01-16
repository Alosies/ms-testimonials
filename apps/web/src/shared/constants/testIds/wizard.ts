export const wizardTestIds = {
  // Focus areas screen
  focusAreasContainer: 'wizard-focus-areas-container',
  focusAreaChip: (index: number) => `wizard-focus-area-chip-${index}`,
} as const;

export type WizardTestId = typeof wizardTestIds;
