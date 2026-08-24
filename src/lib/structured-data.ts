import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SITE_LOCALE,
} from "@/lib/site-config";
import { controlador } from "@/data/privacidade";
import { socialLinks } from "@/data/social";
import { faqItems } from "@/data/faq";
import { serviceSteps } from "@/data/servicos";

// Structured data is emitted as a single @graph so the entities can reference
// one another by @id. Only facts already published elsewhere on the site are
// declared; unverified attributes such as a postal address are omitted rather
// than approximated, since incorrect markup is penalised.
const ORGANISATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const organisation = {
  "@type": "ProfessionalService",
  "@id": ORGANISATION_ID,
  name: SITE_NAME,
  legalName: controlador.denominacao,
  taxID: controlador.nif,
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/icon.png`,
    width: 512,
    height: 512,
  },
  image: `${SITE_URL}/opengraph-image.png`,
  description: SITE_DESCRIPTION,
  email: controlador.emailPrivacidade,
  telephone: controlador.telefone,
  areaServed: {
    "@type": "Country",
    name: "Angola",
  },
  knowsLanguage: SITE_LOCALE,
  sameAs: socialLinks.map((social) => social.href),
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Visio Method™",
    itemListElement: serviceSteps.map((step) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: step.title,
        description: step.summary,
        provider: { "@id": ORGANISATION_ID },
        areaServed: { "@type": "Country", name: "Angola" },
      },
    })),
  },
};

const website = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  inLanguage: SITE_LOCALE,
  publisher: { "@id": ORGANISATION_ID },
};

// Eligible for the FAQ rich result. The questions and answers are the same
// text rendered in the FAQ section, which the guidelines require.
const faqPage = {
  "@type": "FAQPage",
  "@id": `${SITE_URL}/#faq`,
  isPartOf: { "@id": WEBSITE_ID },
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [organisation, website, faqPage],
};
