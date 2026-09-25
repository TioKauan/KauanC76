/** true quando a pessoa pediu "reduzir movimento" nas configurações do aparelho. */
export const reduzirMovimento = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
