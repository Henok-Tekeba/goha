export interface Item {
  name: string;
  org: string;
  badge: string;
  bc: string;
  _type?: string;
  dl: number | null;
  lang: string | null;
  langs: string[];
  isNew: boolean;
  desc: string;
  tags: string[];
  id?: string;
  hf_url?: string;
  url?: string;
  likes?: number;
  downloads_monthly?: number;
  featured?: boolean;
  verified?: boolean;
  added_at?: string;
  growth?: number | null;
  verdict?: { label: string; icon: string; type: string };
  website?: string;
  github?: string;
  hf_org?: string;
  founded?: string;
  models?: string[];
  models_count?: number;
  related_models?: string[];
}

export type Tab = "models" | "datasets" | "companies" | "research";

export interface Stats {
  models: number;
  datasets: number;
  companies: number;
  research: number;
  spaces: number;
  languages: number;
  indexed: string;
  featured: { downloads: number; name: string; lang: string };
}

export interface ActivityItem {
  type: string;
  icon: string;
  message: string;
  ago: string;
}

export interface TrendingItem {
  name: string;
  org: string;
  badge: string;
  growth: number;
  dl: number;
  lang: string;
  desc: string;
  id?: string;
}
