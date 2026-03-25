import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/header";
import HomePage from "./pages/home";
import NewsPage from "./pages/news";
import CareerPage from "./pages/carrer";
import ScrollToTop from "./components/scrollToTop";
import StatsPage from "./pages/stats-page";
import ContactPage from "./pages/contact";
import LivePage from "./pages/live";
import PopUpLive from "./components/popUpLive";

import { LayoutProvider } from "./context/LayoutContext";
import Footer from "./components/footer";
import ExperiencePage from "./pages/experience";
import LegalNoticePage from "./pages/legals/legal-notice";
import PrivacyPolicyPage from "./pages/legals/privacy-policy";
import CookiesPolicyPage from "./pages/legals/cookies-policy";

function AppContent() {
  const location = useLocation();
  const hideHeader = location.pathname === "/experience";

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
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </LayoutProvider>
  );
}

export default App;
