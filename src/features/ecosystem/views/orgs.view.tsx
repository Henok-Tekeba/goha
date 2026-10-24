"use client";

import OrgsGrid from "../components/orgs-grid.component";

export default function OrgsView() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      <header className="mb-8">
        <h1
          className="text-3xl text-primary tracking-[-0.03em] md:text-4xl"
          style={{ fontFamily: "Aspekta", fontWeight: 500 }}
        >
          Organizations
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed">
          Everyone building Ethiopian AI — companies, labs and independent
          researchers — with their full public footprint across Hugging Face and
          GitHub in one profile.
        </p>
      </header>
      <OrgsGrid />
    </div>
  );
}
