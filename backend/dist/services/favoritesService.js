import { Favorite } from '../models/Favorite.js';
import { fetchCharacter, toCharacterSnapshot } from './iceAndFire.js';
import { sendPushToUser } from './pushNotifications.js';
export async function listFavorites(userId) {
    const favorites = await Favorite.find({ userId }).sort({ createdAt: -1 }).lean();
    return favorites.map((f) => {
        const legacy = f;
        return {
            id: String(f._id),
            characterId: f.characterId ?? legacy.swapiId ?? 0,
            characterName: f.characterName ?? 'Unknown',
            characterData: f.characterData ?? {},
            createdAt: f.createdAt
                ? new Date(f.createdAt).toISOString()
                : new Date().toISOString(),
        };
    });
}
export async function addFavorite(userId, characterId) {
    const existing = await Favorite.findOne({ userId, characterId });
    if (existing) {
        const err = new Error('ALREADY_FAVORITE');
        throw err;
    }
    const character = await fetchCharacter(characterId);
    const favorite = await Favorite.create({
        userId,
        characterId,
        characterName: character.name,
        characterData: toCharacterSnapshot(character),
    });
    try {
        await sendPushToUser(userId, {
            title: 'Added to your court',
            body: `${character.name} is now in your favorites.`,
            url: `/characters/${characterId}`,
        });
    }
    catch {
        /* push is optional; favorite save must succeed */
    }
    return {
        id: String(favorite._id),
        characterId: favorite.characterId,
        characterName: favorite.characterName,
        characterData: favorite.characterData,
        createdAt: favorite.createdAt.toISOString(),
    };
}
export async function removeFavorite(userId, characterId) {
    const result = await Favorite.findOneAndDelete({ userId, characterId });
    return !!result;
}
