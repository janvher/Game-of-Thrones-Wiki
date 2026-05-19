export type CharacterStatus = 'Alive' | 'Deceased' | 'Unknown';

/** Ice and Fire often omits alive; infer from died / TV appearances. */
export function deriveCharacterStatus(
  alive: boolean | null | undefined,
  died: string | undefined,
  tvSeries: string[] | undefined,
): CharacterStatus {
  if (alive === true) return 'Alive';
  if (alive === false) return 'Deceased';

  const diedText = (died ?? '').trim();
  if (diedText && diedText !== '—' && !/^unknown$/i.test(diedText)) {
    return 'Deceased';
  }

  if (tvSeries && tvSeries.length > 0) return 'Alive';

  return 'Unknown';
}
