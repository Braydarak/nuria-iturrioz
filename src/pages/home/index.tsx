import Hero from "../../sections/hero";
import AboutMe from "../../sections/about-me";
import PageIntro from "../../components/page-intro";
import Trophies from "../../components/trophies";
import MasonryGallery from "../../sections/gallery";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-screen">
      <PageIntro />
      <Hero />
      <AboutMe />
      <section>
        <Trophies variant="home" />
      </section>
      <section>
        <MasonryGallery />
      </section>
    </main>
  );
}
