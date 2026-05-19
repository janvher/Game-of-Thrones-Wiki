export interface WikiArticle {
    id: number;
    title: string;
    link: string;
    excerpt: string;
    imageUrl?: string;
    date: string;
    categories: string[];
}
export declare function fetchLoreFeed(page?: number, perPage?: number): Promise<WikiArticle[]>;
export declare function searchArticlesForCharacter(characterName: string, perPage?: number): Promise<WikiArticle[]>;
export declare function fetchLatestHubPosts(perPage?: number): Promise<WikiArticle[]>;
