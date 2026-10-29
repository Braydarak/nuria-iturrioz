import { useTranslation } from "react-i18next";

/** Fecha larga en el idioma activo: "7 de septiembre de 2025" */
export function useArticleDate() {
  const { i18n } = useTranslation();
  const formatter = new Intl.DateTimeFormat(i18n.resolvedLanguage ?? "es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (iso: string) => formatter.format(new Date(iso));
}
