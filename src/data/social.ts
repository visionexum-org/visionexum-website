export type SocialLink = {
  label: string;
  handle: string;
  href: string;
  icon: "facebook" | "linkedin" | "instagram" | "tiktok";
};

export const socialLinks: SocialLink[] = [
  {
    label: "Facebook",
    handle: "Visio Nexum",
    href: "https://www.facebook.com/share/1Az6eW645c/?mibextid=wwXIfr",
    icon: "facebook",
  },
  {
    label: "LinkedIn",
    handle: "Visio Nexum",
    href: "https://www.linkedin.com/company/visio-nexum/home/",
    icon: "linkedin",
  },
  {
    label: "Instagram",
    handle: "@visio.nexum",
    href: "https://www.instagram.com/visio.nexum?igsh=MTV3c2hsY2N3anpsNg==",
    icon: "instagram",
  },
  {
    label: "TikTok",
    handle: "@visio.nexum",
    href: "https://www.tiktok.com/@visio.nexum?_r=1&_t=ZS-940UadFMxBS",
    icon: "tiktok",
  },
];
