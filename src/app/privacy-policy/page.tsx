import type { Metadata } from "next";
import { pageMetadata } from "@/shared/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How goha handles information — what we collect, what we don't, and how the directory works.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <main className="w-full max-w-4xl px-6 md:mx-auto">
      {/* Hero Section */}
      <div className="flex w-full flex-col items-start">
        <h1 className="mt-3 text-left text-[26px] leading-tight">
          Privacy Policy
        </h1>
        <p className="mt-3 text-left text-muted-foreground text-sm">
          What goha collects, what it doesn&rsquo;t, and why.
        </p>
      </div>

      {/* Content */}
      <div className="mt-16 mb-28">
        <section className="my-8">
          <h2 className="font-medium text-lg tracking-tight">1. Summary</h2>
          <p className="mt-3 text-muted-foreground text-sm">
            goha is a read-only public directory. We do not require an account,
            we do not run advertising or cross-site tracking, and we do not sell
            data. The only personal information we ever handle is an email
            address you knowingly give us for the newsletter — everything else
            you do on the site stays in your own browser.
          </p>
        </section>

        <section className="my-8">
          <h2 className="font-medium text-lg tracking-tight">
            2. Information We Collect
          </h2>
          <p className="mt-3 text-muted-foreground text-sm">
            <strong>Newsletter:</strong> if you subscribe, your email address is
            stored by a Google Forms-backed mailing list used only to send
            weekly goha updates. You can unsubscribe at any time.
          </p>
          <p className="mt-3 text-muted-foreground text-sm">
            <strong>Your browser, not our servers:</strong> features like the
            watchlist are stored locally in your browser (localStorage). They
            never leave your device.
          </p>
        </section>

        <section className="my-8">
          <h2 className="font-medium text-lg tracking-tight">
            3. Information We Do Not Collect
          </h2>
          <p className="mt-3 text-muted-foreground text-sm">
            We do not use advertising networks, analytics trackers, or
            fingerprinting. We do not collect names, phone numbers, payment
            details, or browsing profiles.
          </p>
        </section>

        <section className="my-8">
          <h2 className="font-medium text-lg tracking-tight">
            4. Third-party Content
          </h2>
          <p className="mt-3 text-muted-foreground text-sm">
            Listings are metadata about public resources from Hugging Face,
            GitHub, and arXiv, collected automatically and shown for discovery.
            Those platforms have their own privacy practices; when you follow a
            link to them, their policies apply.
          </p>
        </section>

        <section className="my-8">
          <h2 className="font-medium text-lg tracking-tight">
            5. Hosting and Infrastructure
          </h2>
          <p className="mt-3 text-muted-foreground text-sm">
            The website is hosted by Vercel, whose infrastructure may process
            standard technical request data (IP address, user agent) to serve
            pages and prevent abuse. The underlying data files are served from
            GitHub.
          </p>
        </section>

        <section className="my-8">
          <h2 className="font-medium text-lg tracking-tight">
            6. Children&rsquo;s Privacy
          </h2>
          <p className="mt-3 text-muted-foreground text-sm">
            goha is a general-audience technical directory and does not
            knowingly collect personal information from children.
          </p>
        </section>

        <section className="my-8">
          <h2 className="font-medium text-lg tracking-tight">
            7. Your Choices
          </h2>
          <p className="mt-3 text-muted-foreground text-sm">
            You can clear your browser storage at any time to remove your
            watchlist and preferences, and unsubscribe from the newsletter using
            the link in any email. For any question about your data, contact us
            via the GitHub repository.
          </p>
        </section>

        <section className="my-8">
          <h2 className="font-medium text-lg tracking-tight">
            8. Changes to This Policy
          </h2>
          <p className="mt-3 text-muted-foreground text-sm">
            If the service changes in a way that affects this policy, we will
            update this page and the effective date below.
          </p>
          <p className="mt-3 text-muted-foreground text-sm">
            Effective date: October 21, 2026.
          </p>
        </section>

        <section className="my-8">
          <h2 className="font-medium text-lg tracking-tight">9. Contact</h2>
          <p className="mt-3 text-muted-foreground text-sm">
            Privacy questions or data-correction requests: open an issue at
            github.com/Henok-Tekeba/goha or contact the maintainer through the
            channels listed in the repository README.
          </p>
        </section>
      </div>
    </main>
  );
}
