/**
 * JSON-LD Structured Data Components for SEO
 *
 * These components add schema.org structured data to improve
 * search engine visibility and enable rich snippets.
 */

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
}

export function OrganizationSchema({
  name = "Apprentice Log",
  url = "https://apprenticelog.nz",
  logo = "https://apprenticelog.nz/icons/icon-512x512.png",
  description = "Voice-to-logbook app for New Zealand trade apprentices. Record your work in 30 seconds, get professional BCITO logbook entries.",
}: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    description,
    sameAs: [
      // Add social media links when available
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@apprenticelog.nz",
      availableLanguage: ["English"],
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "NZ",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface SoftwareAppSchemaProps {
  name?: string;
  operatingSystem?: string;
  applicationCategory?: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
  aggregateRating?: {
    ratingValue: string;
    ratingCount: string;
  };
}

export function SoftwareAppSchema({
  name = "Apprentice Log",
  operatingSystem = "Android, iOS, Web",
  applicationCategory = "BusinessApplication",
  offers = {
    price: "0",
    priceCurrency: "NZD",
  },
  aggregateRating,
}: SoftwareAppSchemaProps) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    operatingSystem,
    applicationCategory,
    offers: {
      "@type": "Offer",
      price: offers.price,
      priceCurrency: offers.priceCurrency,
    },
    description:
      "Voice-to-logbook app for NZ apprentices. Record your work, get professional BCITO entries instantly.",
    downloadUrl: "https://play.google.com/store/apps/details?id=nz.apprenticelog.app",
    featureList: [
      "Voice recording",
      "AI-powered transcription",
      "BCITO-compliant entries",
      "Offline support",
      "Employer dashboard",
    ],
  };

  if (aggregateRating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: aggregateRating.ratingValue,
      ratingCount: aggregateRating.ratingCount,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FAQSchemaProps {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

export function FAQSchema({ questions }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface LocalBusinessSchemaProps {
  name?: string;
  description?: string;
  url?: string;
  priceRange?: string;
}

export function LocalBusinessSchema({
  name = "Apprentice Log",
  description = "Voice-to-logbook software for New Zealand trade apprentices and employers",
  url = "https://apprenticelog.nz",
  priceRange = "Free - $29/month",
}: LocalBusinessSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url,
    priceRange,
    areaServed: {
      "@type": "Country",
      name: "New Zealand",
    },
    audience: {
      "@type": "Audience",
      audienceType: "Trade apprentices, Employers, Training organizations",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Combined schema for landing page
export function LandingPageSchema() {
  return (
    <>
      <OrganizationSchema />
      <SoftwareAppSchema />
      <FAQSchema
        questions={[
          {
            question: "Is Apprentice Log free for apprentices?",
            answer:
              "Yes! Apprentice Log is 100% free for all New Zealand apprentices. Record unlimited logbook entries at no cost.",
          },
          {
            question: "How does voice recording work?",
            answer:
              "Simply press the record button and describe your work. Our AI converts your voice into a professional BCITO-compliant logbook entry in seconds.",
          },
          {
            question: "Does it work offline?",
            answer:
              "Yes, you can record entries offline. They will sync automatically when you're back online.",
          },
          {
            question: "What trades does it support?",
            answer:
              "Apprentice Log supports all BCITO trades including Electrical, Plumbing, Carpentry, Automotive, and Construction.",
          },
          {
            question: "How much does it cost for employers?",
            answer:
              "Employers can start free with up to 2 apprentices. The Pro plan at $29/month includes unlimited apprentices and advanced features.",
          },
        ]}
      />
    </>
  );
}
