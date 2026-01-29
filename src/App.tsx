import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/header";
import HomePage from "./pages/home";
import NewsPage from "./pages/news";
import CareerPage from "./pages/carrer";
import ScrollToTop from "./components/ScrollToTop";
import StatsPage from "./pages/stats-page";

import { LayoutProvider } from "./context/LayoutContext";
import Footer from "./components/footer";

function App() {
  return (
    <LayoutProvider>
      <BrowserRouter>
        <Header />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/carrer" element={<CareerPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </LayoutProvider>
  );
}

export default App;
