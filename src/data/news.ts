import { useState, useEffect } from 'react';

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  thumbnail: string;
  description: string;
  author: string;
}

// URL del feed RSS específico de Nuria (Tag ID: 200899)
const RSS_URL = 'https://live-let.ocs-software.com/blog/tag/200899/feed/';
// Usamos rss2json para convertir XML a JSON y evitar problemas de CORS
const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;

export const useLetNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.status === 'ok') {
          const items = data.items.map((item: {
            title: string;
            link: string;
            pubDate: string;
            thumbnail?: string;
            description: string;
            author: string;
          }) => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            thumbnail: item.thumbnail || extractImageFromDescription(item.description),
            description: cleanDescription(item.description),
            author: item.author
          }));
          setNews(items);
        } else {
          throw new Error('Error al cargar las noticias');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return { news, loading, error };
};

// Ayudante para limpiar el HTML de la descripción y dejar solo texto
function cleanDescription(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
}

// Ayudante para intentar sacar una imagen si no viene en el campo thumbnail
function extractImageFromDescription(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const img = doc.querySelector('img');
  return img ? img.src : '/NuriaLogo.blue.svg'; // Fallback a logo si no hay imagen
}