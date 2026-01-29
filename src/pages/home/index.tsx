import Hero from '../../sections/hero'
import AboutMe from '../../sections/about-me'
import PageIntro from '../../components/page-intro'
import Trophies from '../../components/trophies'

export default function HomePage() {
  return (
    <main className="mx-auto max-w-screen">
      <PageIntro />
      <Hero />
      <AboutMe />
      <Trophies variant='home' />
    </main>
  )
}