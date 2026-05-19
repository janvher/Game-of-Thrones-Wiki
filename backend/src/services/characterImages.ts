import { config } from '../config.js';

interface ThronesApiCharacter {
  fullName: string;
  imageUrl: string;
}

let imageMap: Map<string, string> | null = null;

const MANUAL_IMAGES: Record<string, string> = {
  nightking: '/images/night-king.svg',
};

/** Thrones API spells some names differently */
const NAME_ALIASES: Record<string, string> = {
  jaimelannister: 'Jamie Lannister',
  robstark: 'robb stark',
  daenerystargaryan: 'daenerys targaryen',
};

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function loadImageMap(): Promise<Map<string, string>> {
  if (imageMap) return imageMap;

  const map = new Map<string, string>();
  try {
    const res = await fetch(`${config.thronesApiBaseUrl}/Characters`);
    if (res.ok) {
      const chars = (await res.json()) as ThronesApiCharacter[];
      for (const c of chars) {
        if (c.fullName && c.imageUrl) {
          map.set(normalizeName(c.fullName), c.imageUrl);
        }
      }
    }
  } catch {
    /* images are optional enrichment */
  }

  imageMap = map;
  return map;
}

export function getCharacterImage(name: string): string | undefined {
  if (!name) return undefined;

  const norm = normalizeName(name);
  if (MANUAL_IMAGES[norm]) return MANUAL_IMAGES[norm];

  if (!imageMap) return undefined;

  if (imageMap.has(norm)) return imageMap.get(norm);

  const alias = NAME_ALIASES[norm];
  if (alias && imageMap.has(normalizeName(alias))) {
    return imageMap.get(normalizeName(alias));
  }

  for (const [key, url] of imageMap.entries()) {
    if (norm.includes(key) || key.includes(norm)) {
      return url;
    }
  }

  return undefined;
}

export async function warmImageCache(): Promise<void> {
  await loadImageMap();
}
