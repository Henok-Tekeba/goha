import ExplorePage from "@/components/ExplorePage";

const initialStats = {
  models: 0,
  datasets: 0,
  companies: 0,
  research: 0,
  spaces: 0,
  languages: 6,
  indexed: "loading\u2026",
  featured: { downloads: 0, name: "", lang: "" },
};

export default function Home() {
  return <ExplorePage initialStats={initialStats} />;
}
