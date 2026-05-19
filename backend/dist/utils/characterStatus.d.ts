export type CharacterStatus = 'Alive' | 'Deceased' | 'Unknown';
/** Ice and Fire often omits alive; infer from died / TV appearances. */
export declare function deriveCharacterStatus(alive: boolean | null | undefined, died: string | undefined, tvSeries: string[] | undefined): CharacterStatus;
