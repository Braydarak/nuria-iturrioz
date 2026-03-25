import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const LegalNoticePage = () => {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 pt-28 pb-20">
        <div className="mb-10 flex items-center justify-between gap-4">
          <h1 className="font-signature text-4xl md:text-5xl text-[#2A579E] font-bold">
            {t("legals.legalNotice.title", "Legal Notice")}
          </h1>
          <Link
            to="/"
            className="text-sm font-bold text-[#2A579E] hover:underline"
          >
            {t("legals.backHome", "Back to home")}
          </Link>
        </div>

        <div className="space-y-10 text-gray-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              {t("legals.sections.owner", "Website Owner")}
            </h2>
            <div className="rounded-2xl bg-white border border-gray-100 p-6 space-y-2">
              <p>{t("legals.placeholders.ownerName", "Owner name: [To be completed]")}</p>
              <p>{t("legals.placeholders.ownerId", "Tax ID: [To be completed]")}</p>
              <p>{t("legals.placeholders.ownerAddress", "Address: [To be completed]")}</p>
              <p>
                {t("legals.placeholders.ownerEmail", "Contact email: [To be completed]")}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              {t(
                "legals.updatedAt",
                "Last updated: {{date}}",
                { date: "2026-03-25" },
              )}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              {t("legals.sections.terms", "Terms of Use")}
            </h2>
            <div className="rounded-2xl bg-white border border-gray-100 p-6 space-y-3">
              <p>
                {t(
                  "legals.legalNotice.terms.p1",
                  "Access to and use of this website implies acceptance of these terms. If you do not agree, please refrain from using the site.",
                )}
              </p>
              <p>
                {t(
                  "legals.legalNotice.terms.p2",
                  "Users agree to make proper use of the contents and services and not to use them for unlawful activities or those contrary to good faith and public order.",
                )}
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              {t("legals.sections.ip", "Intellectual Property")}
            </h2>
            <div className="rounded-2xl bg-white border border-gray-100 p-6 space-y-3">
              <p>
                {t(
                  "legals.legalNotice.ip.p1",
                  "All content on this website (texts, images, videos, logos, trademarks and designs) is protected by intellectual and industrial property rights.",
                )}
              </p>
              <p>
                {t(
                  "legals.legalNotice.ip.p2",
                  "Reproduction, distribution or public communication, in whole or in part, is prohibited without prior express authorisation from the owner.",
                )}
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              {t("legals.sections.liability", "Liability")}
            </h2>
            <div className="rounded-2xl bg-white border border-gray-100 p-6 space-y-3">
              <p>
                {t(
                  "legals.legalNotice.liability.p1",
                  "The owner is not liable for the misuse of the information published, nor for damages derived from access or use of the website, except those established by mandatory law.",
                )}
              </p>
              <p>
                {t(
                  "legals.legalNotice.liability.p2",
                  "This website may include links to third-party sites. The owner has no control over their contents and assumes no responsibility for them.",
                )}
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              {t("legals.sections.law", "Applicable Law and Jurisdiction")}
            </h2>
            <div className="rounded-2xl bg-white border border-gray-100 p-6 space-y-3">
              <p>
                {t(
                  "legals.legalNotice.law.p1",
                  "This legal notice is governed by Spanish law. Any dispute will be submitted to the competent courts and tribunals in accordance with applicable regulations.",
                )}
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default LegalNoticePage;
