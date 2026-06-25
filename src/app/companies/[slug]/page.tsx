import { fetchCompanyBySlug } from "@/lib/github";
import CompanyDetail from "@/components/CompanyDetail";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = await fetchCompanyBySlug(slug);
  return {
    title: company ? `${company.name} — goha.et` : "Company not found — goha.et",
    description: company?.desc || "Ethiopian AI company",
  };
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = await fetchCompanyBySlug(slug);
  return <CompanyDetail item={company} />;
}
