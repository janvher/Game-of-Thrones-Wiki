/** Ice and Fire often omits alive; infer from died / TV appearances. */
export function deriveCharacterStatus(alive, died, tvSeries) {
    if (alive === true)
        return 'Alive';
    if (alive === false)
        return 'Deceased';
    const diedText = (died ?? '').trim();
    if (diedText && diedText !== '—' && !/^unknown$/i.test(diedText)) {
        return 'Deceased';
    }
    if (tvSeries && tvSeries.length > 0)
        return 'Alive';
    return 'Unknown';
}
