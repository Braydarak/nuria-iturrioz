import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import ContactForm from "../../components/contactForm";
import SocialLinks from "../../components/socialLinks";
import Animation, { AnimateOnScroll } from "../../components/animation";
import { DEFAULT_OG_IMAGE_URL, SITE_URL } from "../../utils/constants";
import nuriaImg from "../../assets/nuria/web/Nuria9.webp";

const ContactPage = () => {
  const { t } = useTranslation();
  const title = `${t("contactPage.title")} – Nuria Iturrioz`;
  const description = t("contactPage.description");
  const url = `${SITE_URL}/contact`;

  const highlights = [
    { value: "+10k", label: t("contactPage.stats.followers") },
    {
      value: t("contactPage.stats.careerYears"),
      label: t("contactPage.stats.career"),
    },
    {
      value: t("contactPage.stats.global"),
      label: t("contactPage.stats.presence"),
    },
  ];

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

      <main className="min-h-screen bg-[#F8FAFD] pt-[68px] md:pt-[84px]">
        <Animation className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-8 sm:px-6 md:pb-24 md:pt-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          {/* Presentación */}
          <div className="order-1">
            <AnimateOnScroll y={20} x={0} scale={1}>
              <h1 className="font-signature text-5xl text-[#2A579E] md:text-6xl">
                {t("contactPage.title")}
              </h1>
            </AnimateOnScroll>

            <AnimateOnScroll
              y={24}
              x={0}
              scale={1}
              delay={0.05}
              className="hidden lg:block"
            >
              <div className="relative mt-10 mr-4">
                <div className="absolute -bottom-4 -right-4 h-full w-full rounded-3xl bg-[#2A579E]" />
                <img
                  src={nuriaImg}
                  alt="Nuria Iturrioz"
                  decoding="async"
                  className="relative aspect-4/3 w-full rounded-3xl object-cover shadow-xl"
                  style={{ objectPosition: "50% 4%" }}
                />
              </div>
            </AnimateOnScroll>
          </div>

          {/* Formulario: en móvil va justo después del título */}
          <AnimateOnScroll
            y={30}
            x={0}
            scale={1}
            delay={0.1}
            className="order-2 lg:row-span-2"
          >
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-neutral-200/70">
              <div className="h-1.5 bg-linear-to-r from-[#1B3A75] via-[#2A579E] to-[#3C7BEA]" />
              <ContactForm />
            </div>
          </AnimateOnScroll>

          {/* Por qué colaborar */}
          <AnimateOnScroll y={24} x={0} scale={1} className="order-3">
            <h2 className="text-xl font-bold text-[#1B3A75] md:text-2xl">
              {t("contactPage.whyCollaborate")}
            </h2>
            <p className="mt-3 leading-relaxed text-neutral-700">
              {t("contactPage.description")}
            </p>

            <dl className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-[#2A579E]/10 bg-[#2A579E]/10">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col-reverse bg-white px-3 py-4 sm:px-4"
                >
                  <dt className="mt-1 text-[11px] font-bold uppercase leading-snug tracking-wider text-neutral-500">
                    {item.label}
                  </dt>
                  <dd className="text-xl font-semibold text-[#1B3A75] sm:text-2xl">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                {t("footer.followMe")}
              </p>
              <SocialLinks
                className="flex items-center gap-3"
                itemClassName="rounded-full border border-[#2A579E]/15 bg-white p-2.5 text-[#1B3A75] transition-colors hover:border-[#2A579E] hover:bg-[#2A579E] hover:text-white"
              />
            </div>
          </AnimateOnScroll>
        </Animation>
      </main>
    </>
  );
};

export default ContactPage;
