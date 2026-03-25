import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const PrivacyPolicyPage = () => {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 pt-28 pb-20">
        <div className="mb-10 flex items-center justify-between gap-4">
          <h1 className="font-signature text-4xl md:text-5xl text-[#2A579E] font-bold">
            {t("legals.privacy.title", "Privacy Policy")}
          </h1>
          <Link
            to="/"
            className="text-sm font-bold text-[#2A579E] hover:underline"
          >
            {t("legals.backHome", "Back to home")}
          </Link>
        </div>

        <div className="space-y-10 text-gray-700 leading-relaxed">
          <p className="text-sm text-gray-500">
            {t(
              "legals.updatedAt",
              "Last updated: {{date}}",
              { date: "2026-03-25" },
            )}
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              {t("legals.sections.dataController", "Data Controller")}
            </h2>
            <div className="rounded-2xl bg-white border border-gray-100 p-6 space-y-2">
              <p>{t("legals.placeholders.ownerName", "Owner name: [To be completed]")}</p>
              <p>{t("legals.placeholders.ownerId", "Tax ID: [To be completed]")}</p>
              <p>{t("legals.placeholders.ownerAddress", "Address: [To be completed]")}</p>
              <p>
                {t("legals.placeholders.ownerEmail", "Contact email: [To be completed]")}
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              {t("legals.sections.purposes", "Purposes of Processing")}
            </h2>
            <div className="rounded-2xl bg-white border border-gray-100 p-6 space-y-3">
              <p>
                {t(
                  "legals.privacy.purposes.p1",
                  "We process personal data to manage enquiries submitted through the contact form and to maintain communication with users who contact us.",
                )}
              </p>
              <p>
                {t(
                  "legals.privacy.purposes.p2",
                  "If you contact us regarding collaborations, sponsorships or press requests, we will use the information you provide solely to handle your request.",
                )}
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              {t("legals.sections.legalBasis", "Legal Basis")}
            </h2>
            <div className="rounded-2xl bg-white border border-gray-100 p-6 space-y-3">
              <p>
                {t(
                  "legals.privacy.legalBasis.p1",
                  "The legal basis is the user’s consent when submitting forms and the legitimate interest in responding to enquiries and maintaining basic website operation and security.",
                )}
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              {t("legals.sections.recipients", "Recipients")}
            </h2>
            <div className="rounded-2xl bg-white border border-gray-100 p-6 space-y-3">
              <p>
                {t(
                  "legals.privacy.recipients.p1",
                  "Data is not shared with third parties except when required by law or when necessary to provide the service (e.g., hosting or email service providers), under appropriate contracts.",
                )}
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              {t("legals.sections.retention", "Retention Period")}
            </h2>
            <div className="rounded-2xl bg-white border border-gray-100 p-6 space-y-3">
              <p>
                {t(
                  "legals.privacy.retention.p1",
                  "Data will be retained for the time necessary to manage the request and, if applicable, during the legally required periods.",
                )}
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              {t("legals.sections.rights", "Your Rights")}
            </h2>
            <div className="rounded-2xl bg-white border border-gray-100 p-6 space-y-3">
              <p>
                {t(
                  "legals.privacy.rights.p1",
                  "You may exercise your rights of access, rectification, erasure, objection, restriction and portability by contacting the email address indicated above, together with proof of identity.",
                )}
              </p>
              <p>
                {t(
                  "legals.privacy.rights.p2",
                  "You also have the right to lodge a complaint with the Spanish Data Protection Agency (AEPD) if you consider your rights have been infringed.",
                )}
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              {t("legals.sections.security", "Security")}
            </h2>
            <div className="rounded-2xl bg-white border border-gray-100 p-6 space-y-3">
              <p>
                {t(
                  "legals.privacy.security.p1",
                  "We apply reasonable technical and organisational measures to protect personal data against loss, misuse, unauthorised access, disclosure, alteration and destruction.",
                )}
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicyPage;
