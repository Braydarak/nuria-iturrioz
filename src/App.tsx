import "./App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/header";
import ScrollToTop from "./components/scrollToTop";
import PopUpLive from "./components/popUpLive";
import { useTranslation } from "react-i18next";

import { LayoutProvider } from "./context/LayoutContext";
import Footer from "./components/footer";
import HomePage from "./pages/home";
import NewsPage from "./pages/news";
import CareerPage from "./pages/carrer";
import StatsPage from "./pages/stats-page";
import ContactPage from "./pages/contact";
import LivePage from "./pages/live";
import ExperiencePage from "./pages/experience";
import LegalNoticePage from "./pages/legals/legal-notice";
import PrivacyPolicyPage from "./pages/legals/privacy-policy";
import CookiesPolicyPage from "./pages/legals/cookies-policy";

const SITE_URL = "https://nuriaiturrioz.com";
const ROUTER_BASENAME =
  import.meta.env.BASE_URL === "/"
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/$/, "");

function stripRouterBasename(pathname: string) {
  if (!ROUTER_BASENAME) return pathname;
  if (!pathname.startsWith(ROUTER_BASENAME)) return pathname;
  return pathname.slice(ROUTER_BASENAME.length) || "/";
}

function upsertMetaTag(
  key: "name" | "property",
  value: string,
  content: string,
) {
  const escapedValue =
    typeof CSS !== "undefined" && typeof CSS.escape === "function"
      ? CSS.escape(value)
      : value;

  let meta = document.querySelector(
    `meta[${key}="${escapedValue}"]`,
  ) as HTMLMetaElement | null;

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(key, value);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
}

function upsertLinkTag(rel: string, href: string) {
  const escapedRel =
    typeof CSS !== "undefined" && typeof CSS.escape === "function"
      ? CSS.escape(rel)
      : rel;

  let link = document.querySelector(
    `link[rel="${escapedRel}"]`,
  ) as HTMLLinkElement | null;

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    document.head.appendChild(link);
  }

  link.setAttribute("href", href);
}

function AppContent() {
  const location = useLocation();
  const pathname = stripRouterBasename(location.pathname || "/");
  const hideHeader = pathname === "/experience";
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = (i18n.resolvedLanguage || i18n.language || "es")
      .split("-")[0]
      .toLowerCase();

    document.documentElement.lang = lang;
  }, [i18n.language, i18n.resolvedLanguage]);

  useEffect(() => {
    const url = `${SITE_URL}${pathname === "/" ? "/" : pathname}`;

    const seoByPath: Record<string, { title: string; description: string }> = {
      "/": {
        title: "Nuria Iturrioz – Golfista profesional",
        description:
          "Me llamo Nuria Iturrioz y quiero llegar a lo más alto del golf femenino mundial. Aquí podrás saber más de mi pasado, presente y futuro: calendario, resultados, noticias y biografía.",
      },
      "/news": {
        title: "Noticias – Nuria Iturrioz",
        description:
          "Últimas noticias y novedades de Nuria Iturrioz: torneos, resultados, highlights y actualidad.",
      },
      "/career": {
        title: "Carrera – Nuria Iturrioz",
        description:
          "Trayectoria y biografía deportiva de Nuria Iturrioz: hitos, títulos y momentos clave de su carrera.",
      },
      "/stats": {
        title: "Estadísticas – Nuria Iturrioz",
        description:
          "Estadísticas y rendimiento de Nuria Iturrioz: temporadas, resultados y datos relevantes.",
      },
      "/live": {
        title: "En vivo – Nuria Iturrioz",
        description:
          "Seguimiento en vivo de torneos y estado competitivo de Nuria Iturrioz cuando haya información disponible.",
      },
      "/contact": {
        title: "Contacto – Nuria Iturrioz",
        description:
          "Contacto oficial de Nuria Iturrioz para prensa, patrocinio y colaboraciones.",
      },
      "/experience": {
        title: "Experiencia – Nuria Iturrioz",
        description:
          "Una experiencia interactiva para conocer más sobre Nuria Iturrioz: contenido y actividades especiales.",
      },
      "/legal": {
        title: "Aviso legal – Nuria Iturrioz",
        description: "Aviso legal del sitio oficial de Nuria Iturrioz.",
      },
      "/privacy": {
        title: "Política de privacidad – Nuria Iturrioz",
        description:
          "Política de privacidad del sitio oficial de Nuria Iturrioz.",
      },
      "/cookies": {
        title: "Política de cookies – Nuria Iturrioz",
        description: "Política de cookies del sitio oficial de Nuria Iturrioz.",
      },
    };

    const fallback = seoByPath["/"];
    const page = seoByPath[pathname] ?? fallback;

    document.title = page.title;

    upsertMetaTag("name", "description", page.description);
    upsertMetaTag("property", "og:title", page.title);
    upsertMetaTag("property", "og:description", page.description);
    upsertMetaTag("property", "og:url", url);
    upsertMetaTag("name", "twitter:title", page.title);
    upsertMetaTag("name", "twitter:description", page.description);
    upsertMetaTag("name", "twitter:url", url);
    upsertLinkTag("canonical", url);
  }, [pathname]);

  return (
    <>
      {!hideHeader && <Header />}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/career" element={<CareerPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/live" element={<LivePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/experience" element={<ExperiencePage />} />
        <Route path="/legal" element={<LegalNoticePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/cookies" element={<CookiesPolicyPage />} />
      </Routes>
      <PopUpLive />
      <Footer />
    </>
  );
}

function App() {
  return (
    <LayoutProvider>
      <BrowserRouter basename={ROUTER_BASENAME}>
        <AppContent />
      </BrowserRouter>
    </LayoutProvider>
  );
}

export default App;
