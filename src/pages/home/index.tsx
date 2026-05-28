import { Helmet } from "react-helmet-async";
import Hero from "../../sections/hero";
import AboutMe from "../../sections/about-me";
import PageIntro from "../../components/page-intro";
import Trophies from "../../components/trophies";
import MasonryGallery from "../../sections/gallery";
import MovistarSection from "../../sections/movistar";
import Animation, { AnimateOnScroll } from "../../components/animation";
import { DEFAULT_OG_IMAGE_URL, SITE_URL } from "../../utils/constants";

export default function HomePage() {
  const title = "Nuria Iturrioz – Golfista profesional";
  const description =
    "Me llamo Nuria Iturrioz y quiero llegar a lo más alto del golf femenino mundial. Aquí podrás saber más de mi pasado, presente y futuro: calendario, resultados, noticias y biografía.";
  const url = `${SITE_URL}/`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE_URL} />
        <meta property="og:site_name" content="Nuria Iturrioz" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={url} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE_URL} />
      </Helmet>
      <main className="mx-auto max-w-screen">
        <PageIntro />
        <Hero />
        <Animation>
          <AboutMe />
          <AnimateOnScroll y={40} x={0} scale={1}>
            <MovistarSection />
          </AnimateOnScroll>
          <AnimateOnScroll as="section" y={40} x={0} scale={1}>
            <Trophies variant="home" />
          </AnimateOnScroll>
          <AnimateOnScroll as="section">
            <MasonryGallery />
          </AnimateOnScroll>
        </Animation>
      </main>
    </>
  );
}
