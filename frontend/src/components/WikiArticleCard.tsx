import type { WikiArticle } from '../types';

export function WikiArticleCard({ article }: { article: WikiArticle }) {
  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="wiki-article-card"
    >
      {article.imageUrl && (
        <img src={article.imageUrl} alt="" className="wiki-article-thumb" loading="lazy" />
      )}
      <div className="wiki-article-body">
        <span className="wiki-article-cat">{article.categories[0] ?? 'Wiki of Thrones'}</span>
        <h4>{article.title}</h4>
        <p>{article.excerpt}</p>
        <span className="wiki-article-link">Read on wikiofthrones.com →</span>
      </div>
    </a>
  );
}
