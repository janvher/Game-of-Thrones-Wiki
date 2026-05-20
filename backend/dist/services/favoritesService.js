import { Favorite } from '../models/Favorite.js';
import { fetchCharacter, toCharacterSnapshot } from './iceAndFire.js';
import { getCourtProgress, getNewlyUnlockedAchievement, milestoneMessageForAchievement, } from './courtService.js';
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
    const beforeProgress = await getCourtProgress(userId);
    const character = await fetchCharacter(characterId);
    const favorite = await Favorite.create({
        userId,
        characterId,
        characterName: character.name,
        characterData: toCharacterSnapshot(character),
    });
    try {
        const progress = await getCourtProgress(userId);
        const newBadge = getNewlyUnlockedAchievement(beforeProgress, progress);
        const milestone = newBadge ? milestoneMessageForAchievement(newBadge) : null;
        if (milestone) {
            await sendPushToUser(userId, {
                title: milestone.title,
                body: milestone.body,
                url: '/favorites',
            });
        }
        else if (progress.courtSize < 3) {
            await sendPushToUser(userId, {
                title: 'Added to your court',
                body: `${character.name} joined your court. ${3 - progress.courtSize} more for Small Council.`,
                url: `/characters/${characterId}`,
            });
        }
        else {
            await sendPushToUser(userId, {
                title: 'New ally sworn',
                body: `${character.name} is now in your court. Level ${progress.level} · ${progress.courtSize} allies.`,
                url: `/characters/${characterId}`,
            });
        }
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
