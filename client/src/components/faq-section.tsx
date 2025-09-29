import { Helmet } from "react-helmet";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { trackFormStart } from "@/lib/analytics";

interface FaqItem {
  question: string;
  answer: string;
  includeCta?: boolean;
}

interface FaqSectionProps {
  items: FaqItem[];
  pageTitle?: string;
}

export function FaqSection({ items, pageTitle }: FaqSectionProps) {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    if (openItems.includes(index)) {
      setOpenItems(openItems.filter(i => i !== index));
    } else {
      setOpenItems([...openItems, index]);
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <div className="bg-white rounded-xl shadow-lg p-8 my-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          Questions fréquentes
        </h2>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="border-b border-gray-200 last:border-0 pb-4">
              <button
                onClick={() => toggleItem(index)}
                className="w-full flex items-center justify-between text-left py-3 hover:text-blue-600 transition-colors"
                data-testid={`faq-question-${index}`}
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {item.question}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                    openItems.includes(index) ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {openItems.includes(index) && (
                <div className="pt-2 pb-3 text-gray-600 leading-relaxed" data-testid={`faq-answer-${index}`}>
                  <p className="whitespace-pre-line">{item.answer}</p>
                  {item.includeCta && (
                    <div className="mt-4">
                      <Link
                        href="/raccordement-enedis#formulaire-raccordement"
                        onClick={trackFormStart}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
                        data-testid="faq-cta-link"
                      >
                        Commencer ma demande →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
