import DOMPurify from "dompurify";

// Noticias del Ladies European Tour desde su WordPress (permite CORS).
// Las respuestas completas de la API pesan MB por los metadatos SEO, así que
// se piden solo los campos necesarios y las imágenes/categorías aparte, en
// un único pedido cada una. Sin parámetros aleatorios para aprovechar su CDN.
const WP_API = "https://live-let.ocs-software.com/wp-json/wp/v2";
// Etiqueta "200899" (ID de Nuria en el LET): artículos sobre ella
const NURIA_TAG_ID = 192;
const MENTIONS_SEARCH = "Iturrioz";
const LET_PUBLIC_BLOG = "https://ladieseuropeantour.com/blog";
const POST_FIELDS = "id,slug,date,title,excerpt,categories,featured_media";

export type LetArticle = {
  id: number;
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
  imageLarge: string;
  categories: string[];
  /** Artículo en la web pública del LET */
  link: string;
  /** HTML ya sanitizado (solo cuando se pidió el contenido) */
  contentHtml: string | null;
  readingMinutes: number | null;
};

type WpPost = {
  id: number;
  slug: string;
  date: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  content?: { rendered?: string };
  categories?: number[];
  featured_media?: number;
};

type WpMedia = {
  id: number;
  source_url?: string;
  media_details?: { sizes?: Record<string, { source_url?: string }> };
};

const textOf = (html = "") =>
  (new DOMParser().parseFromString(html, "text/html").body.textContent ?? "")
    .replace(/\s+/g, " ")
    .trim();

// Categorías internas del WordPress del LET que no aportan nada al lector
const HIDDEN_CATEGORIES = /homepage|news main|top story/i;

function sanitizeArticle(html: string) {
  const clean = DOMPurify.sanitize(html, {
    FORBID_TAGS: ["script", "iframe", "style", "form", "input"],
    FORBID_ATTR: ["style", "class", "id", "width", "height", "srcset", "sizes"],
  });
  const doc = new DOMParser().parseFromString(clean, "text/html");
  doc.querySelectorAll("a[href]").forEach((a) => {
    // Los enlaces del backend apuntan a la web pública del LET
    const href = a
      .getAttribute("href")!
      .replace("https://live-let.ocs-software.com/blog", LET_PUBLIC_BLOG);
    a.setAttribute("href", href);
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
  });
  doc.querySelectorAll("img").forEach((img) => {
    img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");
  });
  // Párrafos vacíos que dejan los embeds eliminados
  doc.querySelectorAll("p, figure, blockquote").forEach((el) => {
    if (!el.textContent?.trim() && !el.querySelector("img")) el.remove();
  });
  return doc.body.innerHTML;
}

async function wpGet<T>(path: string, params: Record<string, string>) {
  const url = new URL(`${WP_API}/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as T;
  const totalPages = Number(res.headers.get("X-WP-TotalPages") ?? "1");
  return { data, totalPages };
}

const mediaCache = new Map<number, WpMedia>();
const categoryCache = new Map<number, string>();

/** Imágenes y nombres de categorías que falten, en un pedido cada uno */
async function loadExtras(posts: WpPost[]) {
  const mediaIds = [
    ...new Set(posts.map((p) => p.featured_media ?? 0).filter(Boolean)),
  ].filter((id) => !mediaCache.has(id));
  const categoryIds = [
    ...new Set(posts.flatMap((p) => p.categories ?? [])),
  ].filter((id) => !categoryCache.has(id));

  await Promise.all([
    mediaIds.length
      ? wpGet<WpMedia[]>("media", {
          include: mediaIds.join(","),
          per_page: "100",
          _fields: "id,source_url,media_details",
        }).then(({ data }) => data.forEach((m) => mediaCache.set(m.id, m)))
      : null,
    categoryIds.length
      ? wpGet<{ id: number; name: string }[]>("categories", {
          include: categoryIds.join(","),
          per_page: "100",
          _fields: "id,name",
        }).then(({ data }) =>
          data.forEach((c) => categoryCache.set(c.id, textOf(c.name))),
        )
      : null,
  ]);
}

function toArticle(post: WpPost): LetArticle {
  const media = mediaCache.get(post.featured_media ?? 0);
  const sizes = media?.media_details?.sizes ?? {};
  const full = media?.source_url ?? "";
  const content = post.content?.rendered ?? "";
  const words = textOf(content).split(" ").filter(Boolean).length;

  return {
    id: post.id,
    slug: post.slug,
    date: post.date,
    title: textOf(post.title?.rendered),
    excerpt: textOf(post.excerpt?.rendered),
    image: sizes.medium_large?.source_url ?? full,
    imageLarge: sizes["1536x1536"]?.source_url ?? full,
    categories: (post.categories ?? [])
      .map((id) => categoryCache.get(id))
      .filter(
        (name): name is string => !!name && !HIDDEN_CATEGORIES.test(name),
      ),
    link: `${LET_PUBLIC_BLOG}/${post.slug}`,
    contentHtml: content ? sanitizeArticle(content) : null,
    readingMinutes: content ? Math.max(1, Math.round(words / 200)) : null,
  };
}

async function getArticles(params: Record<string, string>) {
  const { data, totalPages } = await wpGet<WpPost[]>("posts", params);
  await loadExtras(data);
  return { articles: data.map(toArticle), totalPages };
}

const articleCache = new Map<string, LetArticle>();
let nuriaPromise: Promise<LetArticle[]> | null = null;

/** Artículos con la etiqueta de Nuria */
export function fetchNuriaNews(): Promise<LetArticle[]> {
  if (!nuriaPromise) {
    nuriaPromise = getArticles({
      tags: String(NURIA_TAG_ID),
      per_page: "100",
      _fields: POST_FIELDS,
    })
      .then(({ articles }) => {
        prefetchNuriaContent();
        return articles;
      })
      .catch((error) => {
        nuriaPromise = null;
        throw error;
      });
  }
  return nuriaPromise;
}

// Precarga en segundo plano el contenido de las noticias de Nuria para que
// abrirlas sea instantáneo
let prefetched = false;
function prefetchNuriaContent() {
  if (prefetched) return;
  prefetched = true;
  getArticles({
    tags: String(NURIA_TAG_ID),
    per_page: "100",
    _fields: `${POST_FIELDS},content`,
  })
    .then(({ articles }) =>
      articles.forEach((a) => articleCache.set(a.slug, a)),
    )
    .catch(() => {
      prefetched = false;
    });
}

/** Otros artículos del LET donde se la menciona (paginado, sin contenido) */
export function fetchMentions(page: number) {
  return getArticles({
    search: MENTIONS_SEARCH,
    tags_exclude: String(NURIA_TAG_ID),
    per_page: "12",
    page: String(page),
    _fields: POST_FIELDS,
  });
}

/** Un artículo completo por slug */
export async function fetchArticle(slug: string): Promise<LetArticle | null> {
  const cached = articleCache.get(slug);
  if (cached) return cached;
  const { articles } = await getArticles({
    slug,
    _fields: `${POST_FIELDS},content`,
  });
  const article = articles[0] ?? null;
  if (article) articleCache.set(slug, article);
  return article;
}
