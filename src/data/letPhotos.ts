// Fotos de Nuria en el Flickr oficial del Ladies European Tour.
// Flickr devuelve como mucho 500 por página: hoy son ~800 en 2 páginas.
const FLICKR_API = "https://api.flickr.com/services/rest/";
const FLICKR_KEY = "49ac91a164fcae48f36480a6b7db13a4";
const LET_FLICKR_USER = "99039037@N06";
const PER_PAGE = 500;

export type LetPhoto = {
  id: string;
  title: string;
  /** "2025-09-07 14:03:11" */
  takenAt: string;
  year: number;
  thumb: string;
  thumbWidth: number;
  thumbHeight: number;
  large: string;
  /** Página de la foto en Flickr */
  flickrUrl: string;
  /** Página de descarga de Flickr para el tamaño más grande disponible */
  downloadUrl: string;
};

type FlickrPhoto = {
  id: string;
  owner: string;
  title: string;
  datetaken: string;
  url_z?: string;
  width_z?: number | string;
  height_z?: number | string;
  url_l?: string;
  url_k?: string;
};

type FlickrPage = {
  stat: string;
  photos: { page: number; pages: number; total: number; photo: FlickrPhoto[] };
};

async function fetchPage(page: number) {
  const url = new URL(FLICKR_API);
  Object.entries({
    method: "flickr.photos.search",
    api_key: FLICKR_KEY,
    user_id: LET_FLICKR_USER,
    text: "Iturrioz Nuria",
    per_page: String(PER_PAGE),
    page: String(page),
    extras: "date_taken,url_z,url_l,url_k",
    format: "json",
    nojsoncallback: "1",
  }).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as FlickrPage;
  if (data.stat !== "ok") throw new Error("Flickr error");
  return data.photos;
}

function toPhoto(p: FlickrPhoto): LetPhoto | null {
  if (!p.url_z) return null;
  const base = `https://www.flickr.com/photos/${p.owner}/${p.id}/`;
  return {
    id: p.id,
    title: p.title,
    takenAt: p.datetaken,
    year: Number(p.datetaken.slice(0, 4)),
    thumb: p.url_z,
    thumbWidth: Number(p.width_z) || 640,
    thumbHeight: Number(p.height_z) || 427,
    large: p.url_k ?? p.url_l ?? p.url_z,
    flickrUrl: base,
    downloadUrl: `${base}sizes/${p.url_k ? "k" : p.url_l ? "l" : "z"}/`,
  };
}

const byNewest = (a: LetPhoto, b: LetPhoto) =>
  b.takenAt.localeCompare(a.takenAt);

let cache: Promise<LetPhoto[]> | null = null;

/**
 * Todas las fotos, de la más reciente a la más antigua. Flickr no ordena bien
 * por fecha en las búsquedas por texto, así que se piden todas y se ordenan
 * acá. Hoy son 2 páginas: se piden juntas para no esperar una tras otra.
 */
export function fetchLetPhotos(): Promise<LetPhoto[]> {
  if (cache) return cache;
  cache = (async () => {
    const [first, second] = await Promise.all([fetchPage(1), fetchPage(2)]);
    const pages = [first, ...(first.pages > 1 ? [second] : [])];
    if (first.pages > 2) {
      pages.push(
        ...(await Promise.all(
          Array.from({ length: first.pages - 2 }, (_, i) => fetchPage(i + 3)),
        )),
      );
    }
    const photos = pages
      .flatMap((page) => page.photo)
      .map(toPhoto)
      .filter((p): p is LetPhoto => !!p);
    // Una foto puede repetirse entre páginas si se publican fotos nuevas
    const unique = [...new Map(photos.map((p) => [p.id, p])).values()];
    return unique.sort(byNewest);
  })().catch((error) => {
    cache = null;
    throw error;
  });
  return cache;
}
