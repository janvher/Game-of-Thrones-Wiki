import { config } from '../config.js';
import { cleanRenderedText } from '../utils/text.js';

export interface WikiArticle {
  id: number;
  title: string;
  link: string;
  excerpt: string;
  imageUrl?: string;
  date: string;
  categories: string[];
}

interface WpPost {
  id: number;
  link: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  yoast_head_json?: { og_image?: Array<{ url: string }> };
  categories: number[];
}

interface WpCategory {
  id: number;
  name: string;
}

const categoryCache = new Map<number, string>();

async function wpFetch<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${config.wikiOfThronesBaseUrl}${path}`);
  } catch (cause) {
    const msg = cause instanceof Error ? cause.message : 'Network error';
    throw new Error(`Wiki of Thrones unreachable: ${msg}`);
  }
  if (!res.ok) {
    throw new Error(`Wiki of Thrones error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function resolveCategoryNames(ids: number[]): Promise<string[]> {
  const names: string[] = [];
  for (const id of ids) {
    if (categoryCache.has(id)) {
      names.push(categoryCache.get(id)!);
      continue;
    }
    try {
      const cat = await wpFetch<WpCategory>(`/categories/${id}`);
      categoryCache.set(id, cat.name);
      names.push(cat.name);
    } catch {
      names.push('Article');
    }
  }
  return names;
}

function mapPost(post: WpPost, categoryNames: string[]): WikiArticle {
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

export async function fetchLoreFeed(page = 1, perPage = 10): Promise<WikiArticle[]> {
  const params = new URLSearchParams({
    categories: String(config.wikiLoreCategoryId),
    per_page: String(perPage),
    page: String(page),
    _embed: '1',
  });
  const posts = await wpFetch<WpPost[]>(`/posts?${params}`);
  const articles: WikiArticle[] = [];
  for (const post of posts) {
    const names = await resolveCategoryNames(post.categories);
    articles.push(mapPost(post, names));
  }
  return articles;
}

export async function searchArticlesForCharacter(
  characterName: string,
  perPage = 6,
): Promise<WikiArticle[]> {
  const params = new URLSearchParams({
    search: characterName,
    per_page: String(perPage),
    _embed: '1',
  });
  const posts = await wpFetch<WpPost[]>(`/posts?${params}`);
  const articles: WikiArticle[] = [];
  const nameLower = characterName.toLowerCase();

  for (const post of posts) {
    const title = cleanRenderedText(post.title.rendered);
    const excerpt = cleanRenderedText(post.excerpt.rendered);
    if (
      !title.toLowerCase().includes(nameLower) &&
      !excerpt.toLowerCase().includes(nameLower)
    ) {
      continue;
    }
    const names = await resolveCategoryNames(post.categories);
    articles.push(mapPost(post, names));
  }

  return articles.slice(0, perPage);
}

export async function fetchLatestHubPosts(perPage = 8): Promise<WikiArticle[]> {
  const params = new URLSearchParams({
    per_page: String(perPage),
    page: '1',
  });
  const posts = await wpFetch<WpPost[]>(`/posts?${params}`);
  const articles: WikiArticle[] = [];
  for (const post of posts) {
    const names = await resolveCategoryNames(post.categories);
    articles.push(mapPost(post, names));
  }
  return articles;
}
