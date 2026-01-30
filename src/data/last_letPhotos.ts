import { useState, useEffect } from "react";

const FLICKR_API_URL =
  "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=49ac91a164fcae48f36480a6b7db13a4&extras=url_z,url_l,url_o&per_page=20&text=Iturrioz+Nuria&user_id=99039037@N06&format=json&nojsoncallback=1";

export interface FlickrPhoto {
  id: string;
  owner: string;
  secret: string;
  server: string;
  farm: number;
  title: string;
  ispublic: number;
  isfriend: number;
  isfamily: number;
  url_z?: string; // Medium 640
  height_z?: number;
  width_z?: number;
  url_l?: string; // Large 1024
  url_o?: string; // Original
}

interface FlickrResponse {
  photos: {
    page: number;
    pages: number;
    perpage: number;
    total: number;
    photo: FlickrPhoto[];
  };
  stat: string;
}

export const useFlickrPhotos = () => {
  const [photos, setPhotos] = useState<FlickrPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchPhotos = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(FLICKR_API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as FlickrResponse;

        if (data.stat !== "ok") {
          throw new Error("Error fetching photos from Flickr");
        }

        if (!cancelled) {
          setPhotos(data.photos.photo);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error desconocido");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPhotos();

    return () => {
      cancelled = true;
    };
  }, []);

  return { photos, loading, error };
};
