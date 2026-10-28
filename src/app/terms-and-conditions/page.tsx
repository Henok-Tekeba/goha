import type { Metadata } from "next";
import { pageMetadata } from "@/shared/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Terms and Conditions",
  description:
    "The terms that govern your use of goha — an open index of the Ethiopian AI ecosystem.",
  path: "/terms-and-conditions",
});

export default function TermsAndConditionsPage() {
  return (
    <main className="w-full max-w-4xl px-6 md:mx-auto">
      {/* Hero Section */}
      <div className="flex w-full flex-col items-start">
        <h1 className="mt-3 text-left text-[26px] leading-tight">
          Terms and Conditions
        </h1>
        <p className="mt-3 text-left text-muted-foreground text-sm">
          The terms that govern your use of goha.
        </p>
      </div>

      {/* Content */}
      <div className="mt-16 mb-28">
        <section className="my-8">
          <h2 className="font-medium text-lg tracking-tight">
            1. What goha is
          </h2>
          <p className="mt-3 text-muted-foreground text-sm">
            goha (ጎሃ) is a free, non-commercial directory that indexes and
            organizes publicly available artificial-intelligence resources for
            Ethiopian languages — including Amharic, Afaan Oromo, Tigrinya,
            Ge&apos;ez and others. It lists models, datasets, companies, and
            research papers so that developers, researchers, and enthusiasts can
            find, compare, and explore them in one place.
          </p>
        </section>

        <section className="my-8">
          <h2 className="font-medium text-lg tracking-tight">
            2. Acceptance of Terms
          </h2>
          <p className="mt-3 text-muted-foreground text-sm">
            By accessing or using goha you agree to these Terms. If you do not
            agree, you must not access or use the website.
          </p>
        </section>

        <section className="my-8">
          <h2 className="font-medium text-lg tracking-tight">
            3. Nature of the Data
          </h2>
          <p className="mt-3 text-muted-foreground text-sm">
            Listings on goha are collected automatically from public sources —
            primarily the Hugging Face Hub, GitHub, and arXiv — and are indexed
            for discovery. Metadata such as download counts, likes, licenses,
            and evaluation results belong to and are published by the original
            creators. goha does not host model weights or datasets; links take
            you to the original source.
          </p>
        </section>

        <section className="my-8">
          <h2 className="font-medium text-lg tracking-tight">4. No Warranty</h2>
          <p className="mt-3 text-muted-foreground text-sm">
            The website and its content are provided &ldquo;as is&rdquo; and
            &ldquo;as available&rdquo;, without warranties of any kind, express
            or implied — including accuracy, completeness, availability, or
            fitness for a particular purpose. Automated collection can be
            incomplete or outdated. Always verify a resource on its original
            source before relying on it.
          </p>
        </section>

        <section className="my-8">
          <h2 className="font-medium text-lg tracking-tight">
            5. Intellectual Property
          </h2>
          <p className="mt-3 text-muted-foreground text-sm">
            Models, datasets, and papers listed on goha are the property of
            their respective creators and are subject to their own licenses.
            Descriptions and statistics are quoted for identification and
            discovery purposes. If you are a rights holder and want an entry
            corrected or removed, contact us and we will act on reasonable
            requests promptly.
          </p>
        </section>

        <section className="my-8">
          <h2 className="font-medium text-lg tracking-tight">
            6. Acceptable Use
          </h2>
          <p className="mt-3 text-muted-foreground text-sm">
            You agree not to misuse the website: no scraping that degrades
            service for others, no attempts to break or bypass security, no
            misrepresentation of your affiliation with listed projects, and no
            use of the site for unlawful purposes.
          </p>
        </section>

        <section className="my-8">
          <h2 className="font-medium text-lg tracking-tight">
            7. Contributions
          </h2>
          <p className="mt-3 text-muted-foreground text-sm">
            Corrections and additions are welcome through pull requests or
            issues on our GitHub repository. By submitting data you confirm you
            have the right to share it and allow goha to display it with
            attribution to the original source.
          </p>
        </section>

        <section className="my-8">
          <h2 className="font-medium text-lg tracking-tight">
            8. Non-commercial Service
          </h2>
          <p className="mt-3 text-muted-foreground text-sm">
            goha is a community project. It does not sell listings or rankings,
            and ranking is not influenced by payment. It is and remains a
            non-commercial service.
          </p>
        </section>

        <section className="my-8">
          <h2 className="font-medium text-lg tracking-tight">
            9. Limitation of Liability
          </h2>
          <p className="mt-3 text-muted-foreground text-sm">
            To the maximum extent permitted by law, goha and its maintainers are
            not liable for any indirect, incidental, or consequential damages
            arising from your use of, or inability to use, the website or any
            resource you discover through it.
          </p>
        </section>

        <section className="my-8">
          <h2 className="font-medium text-lg tracking-tight">
            10. Changes to These Terms
          </h2>
          <p className="mt-3 text-muted-foreground text-sm">
            We may update these Terms as the service evolves. The effective date
            on this page reflects the current version. Continued use of the
            website after changes become effective constitutes acceptance of the
            updated Terms.
          </p>
        </section>

        <section className="my-8">
          <h2 className="font-medium text-lg tracking-tight">
            11. Governing Law
          </h2>
          <p className="mt-3 text-muted-foreground text-sm">
            These Terms are governed by the laws of Ethiopia, without regard to
            conflict-of-law rules.
          </p>
        </section>

        <section className="my-8">
          <h2 className="font-medium text-lg tracking-tight">12. Contact</h2>
          <p className="mt-3 text-muted-foreground text-sm">
            Questions, corrections, or takedown requests: open an issue at
            github.com/Henok-Tekeba/goha or contact the maintainer through the
            channels listed in the repository README.
          </p>
        </section>
      </div>
    </main>
  );
}
