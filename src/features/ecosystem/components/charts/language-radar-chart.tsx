"use client";

import {
  type ChartConfig,
  EChartsRadarChart,
} from "@/components/evilcharts/charts/echarts-radar-chart";

import type { LanguageCoveragePayload } from "../../types/ecosystem.types";

const RADAR_COLORS: { light: string; dark: string }[] = [
  { light: "#2b7fff", dark: "#51a2ff" },
  { light: "#193cb8", dark: "#8ec5ff" },
  { light: "#0e7f6e", dark: "#2dd4bf" },
  { light: "#b45309", dark: "#fbbf24" },
  { light: "#6366f1", dark: "#a5b4fc" },
  { light: "#be123c", dark: "#fb7185" },
];

function buildConfig(languages: string[] | undefined): ChartConfig {
  const config: Record<string, unknown> = {};
  (languages ?? []).forEach((lang, i) => {
    const colors = RADAR_COLORS[i % RADAR_COLORS.length];
    config[lang] = {
      label: lang,
      colors: { light: [colors.light], dark: [colors.dark] },
    };
  });
  return config as ChartConfig;
}

export default function LanguageRadarChart({
  coverage,
  className,
}: {
  coverage: LanguageCoveragePayload;
  className?: string;
}) {
  return (
    <EChartsRadarChart
      data={coverage.rows}
      config={buildConfig(coverage.languages)}
      className={className}
      defaultSelectedDataKey="Amharic"
    >
      <EChartsRadarChart.PolarGrid />
      <EChartsRadarChart.PolarAngleAxis dataKey="task" />
      <EChartsRadarChart.Tooltip />
      <EChartsRadarChart.Legend
        isClickable
        align="center"
        verticalAlign="bottom"
      />
      {coverage.languages.map((lang) => (
        <EChartsRadarChart.Radar
          key={lang}
          dataKey={lang}
          variant="filled"
          fillOpacity={0.18}
          isClickable
        />
      ))}
    </EChartsRadarChart>
  );
}
