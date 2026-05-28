import "./App.css";
import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
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

const ROUTER_BASENAME =
  import.meta.env.BASE_URL === "/"
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/$/, "");

function stripRouterBasename(pathname: string) {
  if (!ROUTER_BASENAME) return pathname;
  if (!pathname.startsWith(ROUTER_BASENAME)) return pathname;
  return pathname.slice(ROUTER_BASENAME.length) || "/";
}

function AppContent() {
  const location = useLocation();
  const pathname = stripRouterBasename(location.pathname || "/");
  const hideHeader = pathname === "/experience";
  const hideFooter = pathname === "/experience" || pathname === "/carrer";
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = (i18n.resolvedLanguage || i18n.language || "es")
      .split("-")[0]
      .toLowerCase();

    document.documentElement.lang = lang;
  }, [i18n.language, i18n.resolvedLanguage]);

  return (
    <>
      {!hideHeader && <Header />}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/career" element={<Navigate to="/carrer" replace />} />
        <Route path="/carrer" element={<CareerPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/live" element={<LivePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/experience" element={<ExperiencePage />} />
        <Route path="/legal" element={<LegalNoticePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/cookies" element={<CookiesPolicyPage />} />
      </Routes>
      <PopUpLive />
      {!hideFooter && <Footer />}
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
