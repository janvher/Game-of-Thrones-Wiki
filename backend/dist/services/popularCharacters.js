import { config } from '../config.js';
import { POPULAR_CHARACTER_SPECS, NIGHT_KING_STATIC, } from '../data/popularCharacters.js';
import { fetchCharacter } from './iceAndFire.js';
import { getCharacterImage, warmImageCache } from './characterImages.js';
function normalize(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}
async function getThronesCast() {
    const res = await fetch(`${config.thronesApiBaseUrl}/Characters`);
    if (!res.ok)
        return [];
    return res.json();
}
function buildFromThrones(name, id, thrones) {
    return {
        id,
        name,
        gender: 'Unknown',
        culture: thrones?.family ?? 'Westeros',
        born: 'Unknown',
        titles: thrones?.title ? [thrones.title] : [],
        tvSeries: [],
        playedBy: [],
        imageUrl: thrones?.imageUrl ?? getCharacterImage(name),
    };
}
export async function fetchPopularCharacters() {
    await warmImageCache();
    const thronesCast = await getThronesCast();
    const results = [];
    for (const spec of POPULAR_CHARACTER_SPECS) {
        if ('staticId' in spec && spec.staticId) {
            results.push({ ...NIGHT_KING_STATIC });
            continue;
        }
        const targetNorm = normalize(spec.name);
        const thronesMatch = thronesCast.find((c) => {
            const castNorm = normalize(c.fullName);
            return (castNorm === targetNorm ||
                (targetNorm === 'jaimelannister' && castNorm === 'jamielannister'));
        });
        let character = null;
        if ('ids' in spec && spec.ids) {
            for (const id of spec.ids) {
                try {
                    const fromApi = await fetchCharacter(id);
                    if (normalize(fromApi.name) === normalize(spec.name) || spec.name.includes(fromApi.name)) {
                        character = {
                            ...fromApi,
                            imageUrl: thronesMatch?.imageUrl ??
                                getCharacterImage(spec.name) ??
                                fromApi.imageUrl,
                        };
                        break;
                    }
                }
                catch {
                    /* try next id */
                }
            }
        }
        if (!character && thronesMatch) {
            const fallbackId = 'ids' in spec && spec.ids.length > 0 ? spec.ids[0] : 8000 + results.length;
            character = buildFromThrones(spec.name, fallbackId, thronesMatch);
        }
        if (character && !character.imageUrl) {
            character.imageUrl = getCharacterImage(spec.name);
        }
        if (!character?.imageUrl)
            continue;
        results.push(character);
    }
    return results;
}
