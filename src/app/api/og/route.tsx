import { ImageResponse } from "@vercel/og";
import { fetchModelById, fetchDatasetById } from "@/lib/github";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "model";
  const id = searchParams.get("id") || "";

  if (!id) {
    return new ImageResponse(
      <Card>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <span style={{ color: "#059669", fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em" }}>goha.et</span>
            <span style={{ color: "#525252", fontSize: 20 }}>/</span>
            <span style={{ color: "#a3a3a3", fontSize: 20 }}>The Home of Ethiopian AI</span>
          </div>
          <h1 style={{ fontSize: 56, fontWeight: 700, color: "#fafafa", margin: 0, marginBottom: 16, lineHeight: 1.1, letterSpacing: "-0.04em" }}>
            See what&apos;s being built
          </h1>
          <h1 style={{ fontSize: 56, fontWeight: 700, color: "#059669", margin: 0, marginBottom: 32, lineHeight: 1.1, letterSpacing: "-0.04em" }}>
            for Ethiopian languages.
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            <span style={{ fontSize: 36, fontWeight: 600, color: "#fafafa" }}>Models</span>
            <span style={{ fontSize: 36, fontWeight: 600, color: "#fafafa" }}>Datasets</span>
            <span style={{ fontSize: 36, fontWeight: 600, color: "#fafafa" }}>Companies</span>
            <span style={{ fontSize: 36, fontWeight: 600, color: "#fafafa" }}>Research</span>
          </div>
        </div>
        <Footer />
      </Card>,
      { width: 1200, height: 630 }
    );
  }

  if (type === "dataset") {
    const dataset = await fetchDatasetById(id);
    const name = dataset?.name || "Dataset not found";
    const org = dataset?.org || "";
    const downloads = dataset?.downloads_monthly ?? dataset?.dl ?? 0;
    const likes = dataset?.likes ?? 0;
    const langs = dataset?.langs?.length ? dataset.langs.join(" · ") : "";

    return new ImageResponse(
      <Card>
        <TopBar />
        <Content>
          <Badge color="#14b8a6" bg="#042f2e">Dataset</Badge>
          <Title>{name}</Title>
          {org && <Subtitle>by {org}</Subtitle>}
          <Stats>
            <StatItem value={fmt(downloads)} label="downloads / mo" />
            <StatItem value={fmt(likes)} label="likes" />
            {langs && <StatItem value={langs} label="languages" />}
          </Stats>
        </Content>
        <Footer />
      </Card>,
      { width: 1200, height: 630 }
    );
  }

  const model = await fetchModelById(id);
  const name = model?.name || "Model not found";
  const org = model?.org || "";
  const badge = model?.badge || "";
  const downloads = model?.dl ?? model?.downloads_monthly ?? 0;
  const likes = model?.likes ?? 0;
  const growth = model?.growth;

  return new ImageResponse(
    <Card>
      <TopBar />
      <Content>
        {badge && <Badge color="#059669" bg="#052e16">{badge}</Badge>}
        <Title>{name}</Title>
        {org && <Subtitle>by {org}</Subtitle>}
        <Stats>
          <StatItem value={fmt(downloads)} label="downloads / mo" />
          <StatItem value={fmt(likes)} label="likes" />
          {growth != null && <StatItem value={`${growth > 0 ? "+" : ""}${growth}%`} label="growth" color="#10b981" />}
        </Stats>
      </Content>
      <Footer />
    </Card>,
    { width: 1200, height: 630 }
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: "100%", height: "100%", display: "flex", flexDirection: "column",
      backgroundColor: "#0a0a0a", padding: 64, fontFamily: "sans-serif",
    }}>
      {children}
    </div>
  );
}

function TopBar() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
      <span style={{ color: "#059669", fontSize: 20, fontWeight: 700 }}>goha.et</span>
      <span style={{ color: "#525252", fontSize: 16 }}>—</span>
      <span style={{ color: "#a3a3a3", fontSize: 16 }}>Ethiopian AI Radar</span>
    </div>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
      {children}
    </div>
  );
}

function Badge({ color, bg, children }: { color: string; bg: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <span style={{ color, backgroundColor: bg, fontSize: 14, fontWeight: 600, padding: "4px 12px", borderRadius: 999 }}>
        {children}
      </span>
    </div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h1 style={{
      fontSize: 48, fontWeight: 700, color: "#fafafa", margin: 0,
      marginBottom: 8, lineHeight: 1.15, letterSpacing: "-0.03em",
    }}>
      {children}
    </h1>
  );
}

function Subtitle({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 24, color: "#a3a3a3", margin: 0, marginBottom: 32 }}>{children}</p>;
}

function Stats({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 32 }}>{children}</div>;
}

function StatItem({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
      <span style={{ fontSize: 32, fontWeight: 600, color: color || "#fafafa" }}>{value}</span>
      <span style={{ fontSize: 16, color: "#737373" }}>{label}</span>
    </div>
  );
}

function Footer() {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      borderTop: "1px solid #262626", paddingTop: 24, color: "#525252", fontSize: 14,
    }}>
      <span>goha.et</span>
      <span>Track the Ethiopian AI ecosystem</span>
    </div>
  );
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return String(n);
}
