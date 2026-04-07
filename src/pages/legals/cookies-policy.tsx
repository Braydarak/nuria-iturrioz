import { useTranslation } from "react-i18next";

const CookiesPolicyPage = () => {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 pt-50 pb-20">
        <div className="mb-10">
          <h1 className="font-signature text-4xl md:text-5xl text-[#2A579E] font-bold">
            {t("legals.cookies.title", "Cookies Policy")}
          </h1>
        </div>

        <div className="space-y-10 text-gray-700 leading-relaxed">
          <p className="text-sm text-gray-500">
            {t(
              "legals.contactHint",
              "Para cualquier consulta, puedes comunicarte a",
            )}{" "}
            <a
              href="mailto:info@nuriaiturrioz.com"
              className="text-[#2A579E] hover:underline"
            >
              info@nuriaiturrioz.com
            </a>
          </p>
          <p className="text-sm text-gray-500">
            {t("legals.updatedAt", "Last updated: {{date}}", {
              date: "2026-03-25",
            })}
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              {t("legals.sections.whatAreCookies", "What are cookies?")}
            </h2>
            <div className="rounded-2xl bg-white border border-gray-100 p-6 space-y-3">
              <p>
                {t(
                  "legals.cookies.what.p1",
                  "Cookies are small files that are downloaded to your device when you access certain websites. They allow, among other things, storing and retrieving information about a user’s browsing habits or device.",
                )}
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              {t("legals.sections.types", "Types of cookies")}
            </h2>
            <div className="rounded-2xl bg-white border border-gray-100 p-6 space-y-3">
              <p>
                {t(
                  "legals.cookies.types.p1",
                  "This website may use technical cookies (necessary for the website to function) and, where applicable, preference, analytics or advertising cookies.",
                )}
              </p>
              <p>
                {t(
                  "legals.cookies.types.p2",
                  "If analytics or advertising cookies are used, you will be able to accept or reject them through the cookie settings mechanism when available.",
                )}
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              {t("legals.sections.manage", "How to manage cookies")}
            </h2>
            <div className="rounded-2xl bg-white border border-gray-100 p-6 space-y-3">
              <p>
                {t(
                  "legals.cookies.manage.p1",
                  "You can allow, block or delete cookies installed on your device through your browser settings. Disabling cookies may affect the proper functioning of some features.",
                )}
              </p>
              <p>
                {t(
                  "legals.cookies.manage.p2",
                  "For more information, consult your browser’s help section (Chrome, Safari, Firefox, Edge).",
                )}
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              {t("legals.sections.contact", "Contact")}
            </h2>
            <div className="rounded-2xl bg-white border border-gray-100 p-6 space-y-3">
              <p>
                {t(
                  "legals.cookies.contact.p1",
                  "If you have questions about this cookies policy, you can contact us using the email address shown in the legal notice / privacy policy.",
                )}
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default CookiesPolicyPage;
