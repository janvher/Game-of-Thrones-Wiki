import { config } from '../config.js';
import { cleanRenderedText } from '../utils/text.js';
const categoryCache = new Map();
async function wpFetch(path) {
    let res;
    try {
        res = await fetch(`${config.wikiOfThronesBaseUrl}${path}`);
    }
    catch (cause) {
        const msg = cause instanceof Error ? cause.message : 'Network error';
        throw new Error(`Wiki of Thrones unreachable: ${msg}`);
    }
    if (!res.ok) {
        throw new Error(`Wiki of Thrones error: ${res.status}`);
    }
    return res.json();
}
async function resolveCategoryNames(ids) {
    const names = [];
    for (const id of ids) {
        if (categoryCache.has(id)) {
            names.push(categoryCache.get(id));
            continue;
        }
        try {
            const cat = await wpFetch(`/categories/${id}`);
            categoryCache.set(id, cat.name);
            names.push(cat.name);
        }
        catch {
            names.push('Article');
        }
    }
    return names;
}
function mapPost(post, categoryNames) {
    return {
        id: post.id,
        title: cleanRenderedText(post.title.rendered),
        link: post.link,
        excerpt: cleanRenderedText(post.excerpt.rendered).slice(0, 220),
        imageUrl: post.yoast_head_json?.og_image?.[0]?.url,
        date: post.date,
        categories: categoryNames,
    };
}
export async function fetchLoreFeed(page = 1, perPage = 10) {
    const params = new URLSearchParams({
        categories: String(config.wikiLoreCategoryId),
        per_page: String(perPage),
        page: String(page),
        _embed: '1',
    });
    const posts = await wpFetch(`/posts?${params}`);
    const articles = [];
    for (const post of posts) {
        const names = await resolveCategoryNames(post.categories);
        articles.push(mapPost(post, names));
    }
    return articles;
}
export async function searchArticlesForCharacter(characterName, perPage = 6) {
    const params = new URLSearchParams({
        search: characterName,
        per_page: String(perPage),
        _embed: '1',
    });
    const posts = await wpFetch(`/posts?${params}`);
    const articles = [];
    const nameLower = characterName.toLowerCase();
    for (const post of posts) {
        const title = cleanRenderedText(post.title.rendered);
        const excerpt = cleanRenderedText(post.excerpt.rendered);
        if (!title.toLowerCase().includes(nameLower) &&
            !excerpt.toLowerCase().includes(nameLower)) {
            continue;
        }
        const names = await resolveCategoryNames(post.categories);
        articles.push(mapPost(post, names));
    }
    return articles.slice(0, perPage);
}
export async function fetchLatestHubPosts(perPage = 8) {
    const params = new URLSearchParams({
        per_page: String(perPage),
        page: '1',
    });
    const posts = await wpFetch(`/posts?${params}`);
    const articles = [];
    for (const post of posts) {
        const names = await resolveCategoryNames(post.categories);
        articles.push(mapPost(post, names));
    }
    return articles;
}
