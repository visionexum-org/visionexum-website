export type SocialLink = {
  label: string;
  handle: string;
  href: string;
  icon: "facebook" | "linkedin" | "instagram" | "tiktok";
};

// MOCK — substituir pelos handles/URLs reais das redes sociais da Visio Nexum.
export const socialLinks: SocialLink[] = [
  {
    label: "Facebook",
    handle: "@visionexum",
    href: "https://facebook.com/visionexum",
    icon: "facebook",
  },
  {
    label: "LinkedIn",
    handle: "@visionexum",
    href: "https://linkedin.com/company/visionexum",
    icon: "linkedin",
  },
  {
    label: "Instagram",
    handle: "@visionexum",
    href: "https://instagram.com/visionexum",
    icon: "instagram",
  },
  {
    label: "TikTok",
    handle: "@visionexum",
    href: "https://tiktok.com/@visionexum",
    icon: "tiktok",
  },
];
