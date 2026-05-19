import mongoose from 'mongoose';
/** Drop legacy Star Wars index and map swapiId → characterId */
export async function migrateFavoritesCollection() {
    const db = mongoose.connection.db;
    if (!db)
        return;
    const collection = db.collection('favorites');
    try {
        const indexes = await collection.indexes();
        for (const idx of indexes) {
            if (idx.key && 'swapiId' in idx.key && idx.name) {
                await collection.dropIndex(idx.name);
                console.log('Dropped legacy index:', idx.name);
            }
        }
    }
    catch (err) {
        console.warn('Index migration skipped:', err);
    }
    await collection.updateMany({ swapiId: { $exists: true, $ne: null }, $or: [{ characterId: { $exists: false } }, { characterId: null }] }, [{ $set: { characterId: '$swapiId' } }]);
    await collection.updateMany({ swapiId: { $exists: true } }, { $unset: { swapiId: '' } });
    // Remove broken rows that would break unique characterId index
    await collection.deleteMany({
        $or: [{ characterId: { $exists: false } }, { characterId: null }],
    });
}
