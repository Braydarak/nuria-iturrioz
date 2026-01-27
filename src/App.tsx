
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/header'
import HomePage from './pages/home'
import CareerPage from './pages/carrer'
import ScrollToTop from './components/ScrollToTop'
import StatsPage from './pages/stats-page'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/carrer" element={<CareerPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
