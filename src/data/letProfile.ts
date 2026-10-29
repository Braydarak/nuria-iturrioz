// Perfil de Nuria en la API del LET (OCS). Se pide una sola vez por carga de
// página y lo comparten todas las secciones que lo usan.
const PROFILE_URL = `https://api.euro.ocs-software.com/let/cache/let/profiles/200899?randomadd=${Date.now()}`;

let profilePromise: Promise<unknown> | null = null;

export function fetchLetProfile(): Promise<unknown> {
  if (!profilePromise) {
    profilePromise = fetch(PROFILE_URL, {
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<unknown>;
      })
      .catch((error) => {
        // Si falla, el próximo intento vuelve a pedirlo
        profilePromise = null;
        throw error;
      });
  }
  return profilePromise;
}
