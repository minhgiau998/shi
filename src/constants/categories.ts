export const CATEGORY_VALUES = ['Food', 'Medicine', 'Cosmetics'] as const;

export const CATEGORIES = CATEGORY_VALUES.map(v => ({ label: v, value: v }));

export type CategoryType = typeof CATEGORY_VALUES[number];
