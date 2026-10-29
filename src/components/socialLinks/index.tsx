import type { ReactNode } from "react";

type SocialLink = { label: string; href: string; icon: ReactNode };

const strokeIcon = (children: ReactNode) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/nuriaitu",
    icon: strokeIcon(
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </>,
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/nuriaitu",
    icon: strokeIcon(
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
    ),
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/nuriaitu",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/nuria-iturrioz-79176b128/",
    icon: strokeIcon(
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </>,
    ),
  },
];

type SocialLinksProps = {
  className?: string;
  itemClassName?: string;
};

export default function SocialLinks({
  className = "flex items-center gap-6",
  itemClassName = "p-2 rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 transition-all duration-300 border border-white/5",
}: SocialLinksProps) {
  return (
    <div className={className}>
      {SOCIAL_LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className={itemClassName}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}
