import React, { useState, type ReactNode } from "react";
import emailjs from "@emailjs/browser";
import { useTranslation } from "react-i18next";

type ContactType = "sponsor" | "press" | "fan" | "other";
type Field = "contactType" | "name" | "email";

const EMPTY_FORM = { contactType: "", name: "", email: "", message: "" };
const EMPTY_ERRORS: Record<Field, string> = {
  contactType: "",
  name: "",
  email: "",
};

const icon = (d: string) => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const CONTACT_TYPES: { value: ContactType; icon: ReactNode }[] = [
  {
    value: "sponsor",
    icon: icon(
      "M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8-4.3-4.1 5.9-.9L12 3Z",
    ),
  },
  {
    value: "press",
    icon: icon(
      "M4 5h12v14H6a2 2 0 0 1-2-2V5Zm12 4h4v8a2 2 0 0 1-2 2h-2M8 9h4M8 13h4",
    ),
  },
  {
    value: "fan",
    icon: icon(
      "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z",
    ),
  },
  {
    value: "other",
    icon: icon(
      "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-5 5v-5Z",
    ),
  },
];

const inputClass = (hasError: boolean) =>
  `w-full rounded-xl border bg-neutral-50 px-4 py-3.5 text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:bg-white focus:ring-4 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-neutral-200 hover:border-neutral-300 focus:border-[#2A579E] focus:ring-[#2A579E]/10"
  }`;

const ContactForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  // Campo trampa: invisible para personas, los bots suelen completarlo
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const validateField = (name: Field, value: string) => {
    if (name === "email") {
      if (!value) return t("contactForm.email.errorRequired");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return t("contactForm.email.errorInvalid");
    }
    if (name === "name" && !value.trim()) return t("contactForm.name.error");
    if (name === "contactType" && !value)
      return t("contactForm.contactType.error");
    return "";
  };

  const update = (name: keyof typeof EMPTY_FORM, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name !== "message" && errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => update(e.target.name as keyof typeof EMPTY_FORM, e.target.value);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const name = e.target.name as Field;
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, e.target.value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<Field, string> = {
      contactType: validateField("contactType", formData.contactType),
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
    };
    setErrors(newErrors);
    const firstError = (Object.keys(newErrors) as Field[]).find(
      (k) => newErrors[k],
    );
    if (firstError) {
      document.getElementById(`field-${firstError}`)?.focus();
      return;
    }

    if (website) {
      // Bot: se simula el envío sin mandar nada
      setStatus("success");
      return;
    }

    setStatus("submitting");
    try {
      await emailjs.send(
        "service_uqe39ik",
        "template_5nqszc9",
        {
          from_name: formData.name,
          from_email: formData.email,
          contact_type: formData.contactType,
          message: formData.message,
        },
        "mIzxSsy4oAw6-JJXk",
      );
      setStatus("success");
      setFormData(EMPTY_FORM);
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2A579E] text-white shadow-lg">
          <svg
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <h2 className="mt-6 text-2xl font-bold text-neutral-900">
          {t("contactForm.successTitle")}
        </h2>
        <p className="mt-2 max-w-sm text-neutral-600">
          {t("contactForm.success")}
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-8 rounded-full border-2 border-[#1B3A75] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[#1B3A75] transition-colors hover:bg-[#1B3A75] hover:text-white"
        >
          {t("contactForm.sendAnother")}
        </button>
      </div>
    );
  }

  const errorText = (field: Field) =>
    errors[field] ? (
      <p
        id={`error-${field}`}
        className="mt-1.5 text-xs font-medium text-red-600"
      >
        {errors[field]}
      </p>
    ) : null;

  return (
    <div className="p-6 sm:p-8 md:p-10">
      <h2 className="text-2xl font-bold text-[#1B3A75] md:text-3xl">
        {t("contactForm.title")}
      </h2>
      <p className="mt-2 text-neutral-600">{t("contactForm.subtitle")}</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
        {/* Motivo */}
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-neutral-800">
            {t("contactForm.contactType.label")}{" "}
            <span className="text-red-500" aria-hidden="true">
              *
            </span>
          </legend>
          <div
            id="field-contactType"
            tabIndex={-1}
            role="radiogroup"
            aria-invalid={!!errors.contactType}
            aria-describedby={
              errors.contactType ? "error-contactType" : undefined
            }
            className="grid grid-cols-2 gap-3 outline-none sm:grid-cols-4"
          >
            {CONTACT_TYPES.map((type) => {
              const selected = formData.contactType === type.value;
              return (
                <label
                  key={type.value}
                  className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 text-center text-sm font-semibold transition-colors has-focus-visible:ring-4 has-focus-visible:ring-[#2A579E]/20 ${
                    selected
                      ? "border-[#2A579E] bg-[#2A579E]/5 text-[#1B3A75]"
                      : errors.contactType
                        ? "border-red-300 text-neutral-700 hover:border-red-400"
                        : "border-neutral-200 text-neutral-700 hover:border-[#2A579E]/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="contactType"
                    value={type.value}
                    checked={selected}
                    onChange={() => update("contactType", type.value)}
                    className="sr-only"
                  />
                  <span
                    className={selected ? "text-[#2A579E]" : "text-neutral-400"}
                  >
                    {type.icon}
                  </span>
                  {t(`contactForm.contactType.options.${type.value}`)}
                </label>
              );
            })}
          </div>
          {errorText("contactType")}
        </fieldset>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="field-name"
              className="mb-2 block text-sm font-semibold text-neutral-800"
            >
              {t("contactForm.name.label")}{" "}
              <span className="text-red-500" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="field-name"
              type="text"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t("contactForm.name.placeholder")}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "error-name" : undefined}
              className={inputClass(!!errors.name)}
            />
            {errorText("name")}
          </div>
          <div>
            <label
              htmlFor="field-email"
              className="mb-2 block text-sm font-semibold text-neutral-800"
            >
              {t("contactForm.email.label")}{" "}
              <span className="text-red-500" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="field-email"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t("contactForm.email.placeholder")}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "error-email" : undefined}
              className={inputClass(!!errors.email)}
            />
            {errorText("email")}
          </div>
        </div>

        <div>
          <label
            htmlFor="field-message"
            className="mb-2 block text-sm font-semibold text-neutral-800"
          >
            {t("contactForm.message.label")}{" "}
            <span className="ml-1 text-xs font-normal text-neutral-400">
              {t("contactForm.message.optional")}
            </span>
          </label>
          <textarea
            id="field-message"
            name="message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            placeholder={t("contactForm.message.placeholder")}
            className={`${inputClass(false)} resize-y`}
          />
        </div>

        {/* Campo trampa anti-spam, fuera de la vista y del foco */}
        <div
          aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
        >
          <label>
            Website
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </label>
        </div>

        {status === "error" && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
          >
            {t("contactForm.error")}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="group flex w-full items-center justify-center gap-3 rounded-full bg-[#1B3A75] px-6 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg transition-colors hover:bg-[#2A579E] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2A579E]/30 disabled:cursor-not-allowed disabled:opacity-80"
        >
          {status === "submitting" ? (
            <>
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-25"
                />
                <path
                  fill="currentColor"
                  className="opacity-75"
                  d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4Z"
                />
              </svg>
              {t("contactForm.submit.sending")}
            </>
          ) : (
            <>
              {t("contactForm.submit.default")}
              <svg
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
