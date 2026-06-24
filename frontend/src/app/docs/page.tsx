"use client";

import { useState } from "react";

const CODE_EXAMPLES = {
  curl: `curl -H "X-API-Key: YOUR_KEY" https://goha.et/v1/models?limit=3`,
  python: `import requests

headers = {"X-API-Key": "YOUR_KEY"}
r = requests.get("https://goha.et/v1/models", params={"limit": 3}, headers=headers)
print(r.json())`,
  javascript: `const res = await fetch("https://goha.et/v1/models?limit=3", {
  headers: { "X-API-Key": "YOUR_KEY" },
});
const data = await res.json();
console.log(data);`,
};

const ENDPOINTS = [
  {
    method: "GET",
    path: "/v1/models",
    desc: "List all models with optional filters.",
    params: [
      { name: "task", type: "string", desc: "Filter by task type (ASR, LLM, Translation, NER, etc.)" },
      { name: "language", type: "string", desc: "Filter by language code (am, om, ti, gz)" },
      { name: "sort", type: "string", desc: "Sort order: downloads, likes, new" },
      { name: "limit", type: "integer", desc: "Results per page (max 100, default 20)" },
      { name: "page", type: "integer", desc: "Page number (default 1)" },
    ],
    example: `{
  "data": [
    {
      "name": "Aleph ፩",
      "org": "Addis AI",
      "badge": "LLM",
      "bc": "b-llm",
      "dl": 1204,
      "lang": "AM",
      "langs": ["amharic", "tigrinya"],
      "desc": "First Ethiopian-built foundational LLM.",
      "tags": ["llm", "amharic"],
      "likes": 340,
      "downloads_monthly": 1204,
      "isNew": true
    }
  ],
  "total": 169,
  "page": 1,
  "limit": 20
}`,
  },
  {
    method: "GET",
    path: "/v1/models/best",
    desc: "Best model per task type (highest downloads).",
    params: [],
    example: `{
  "data": [
    {
      "task": "ASR",
      "name": "Shook Medium Amharic 2K",
      "org": "b1n1yam",
      "downloads_monthly": 78,
      "likes": 12,
      "lang": "AM"
    }
  ],
  "total": 7,
  "page": 1,
  "limit": 7
}`,
  },
  {
    method: "GET",
    path: "/v1/models/:id",
    desc: "Full model detail including all metadata.",
    params: [
      { name: "id", type: "string", desc: "Model ID or name (e.g. addis-ai/aleph or Aleph ፩)" },
    ],
    example: `{
  "data": {
    "name": "Aleph ፩",
    "org": "Addis AI",
    "badge": "LLM",
    "bc": "b-llm",
    "dl": 1204,
    "lang": "AM",
    "langs": ["amharic", "tigrinya"],
    "desc": "First Ethiopian-built foundational LLM.",
    "tags": ["llm", "amharic"],
    "likes": 340,
    "downloads_monthly": 1204,
    "isNew": true,
    "hf_url": "https://huggingface.co/addis-ai/aleph"
  }
}`,
  },
  {
    method: "GET",
    path: "/v1/datasets",
    desc: "List all datasets with optional filters.",
    params: [
      { name: "language", type: "string", desc: "Filter by language code (am, om, ti, gz)" },
      { name: "sort", type: "string", desc: "Sort order: downloads, new" },
      { name: "limit", type: "integer", desc: "Results per page (max 100, default 20)" },
      { name: "page", type: "integer", desc: "Page number (default 1)" },
    ],
    example: `{
  "data": [
    {
      "name": "WAXAL Amharic TTS",
      "org": "Google Research",
      "badge": "Dataset",
      "dl": 2341,
      "lang": "AM",
      "langs": ["amharic"],
      "desc": "40-hour Amharic TTS dataset.",
      "likes": 210,
      "downloads_monthly": 2341
    }
  ],
  "total": 208,
  "page": 1,
  "limit": 20
}`,
  },
  {
    method: "GET",
    path: "/v1/stats",
    desc: "Ecosystem-level statistics at a glance.",
    params: [],
    example: `{
  "data": {
    "models": 169,
    "datasets": 208,
    "papers": 50,
    "companies": 4,
    "spaces": 127,
    "repos": 131,
    "total_downloads_monthly": 84721,
    "total_likes": 12340,
    "top_authors": [
      { "name": "Atnafu L.", "count": 5 },
      { "name": "Tadesse A.", "count": 4 }
    ]
  }
}`,
  },
  {
    method: "GET",
    path: "/v1/trending",
    desc: "Top 6 trending models with growth percentages.",
    params: [],
    example: `{
  "data": [
    {
      "name": "Aleph ፩",
      "org": "Addis AI",
      "badge": "LLM",
      "growth": 47,
      "dl": 1204,
      "lang": "AM",
      "desc": "First Ethiopian-built foundational LLM.",
      "id": "addis-ai/aleph"
    }
  ],
  "total": 6,
  "page": 1,
  "limit": 6
}`,
  },
];

export default function DocsPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [activeCode, setActiveCode] = useState<string>("curl");
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    if (!email.trim() || !name.trim()) return;
    setRegistering(true);
    try {
      const res = await fetch("/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setRegisterError(data.error || "Failed to register"); return; }
      setApiKey(data.data.key);
    } catch { setRegisterError("Network error"); }
    finally { setRegistering(false); }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="flex items-center justify-between px-4 sm:px-6 h-14 sm:h-[52px] bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-[100]">
        <a href="/" className="font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100 tracking-tight hover:opacity-70 transition-opacity">
          goha<span className="text-emerald-600 dark:text-emerald-400 not-italic">.et</span>
        </a>
        <a href="/stats" className="text-xs sm:text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 px-2.5 py-1.5 rounded-full transition-colors">
          Stats
        </a>
      </nav>

      <div className="flex-1 flex justify-center px-4 sm:px-6 py-10 sm:py-16">
        <div className="w-full max-w-[720px]">
          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 rounded-full px-2 py-0.5 inline-block uppercase tracking-wider mb-4">
            API
          </span>
          <h1 className="text-[28px] sm:text-[32px] font-medium tracking-[-0.03em] text-neutral-900 dark:text-neutral-100 mb-2">
            Developer API
          </h1>
          <p className="text-[15px] sm:text-base text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed max-w-xl">
            Programmatic access to every model, dataset, paper, and stat in the goha.et index. All endpoints return JSON with <span className="font-mono text-[13px] text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-1 rounded">{`{ data, total, page, limit }`}</span>.
          </p>

          {/* API Key Section */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 sm:p-6 mb-8">
            <h2 className="text-[16px] font-medium text-neutral-900 dark:text-neutral-100 mb-1 tracking-tight">1. Get your API key</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">Enter your email and name to receive a free key (1000 requests/day).</p>
            {apiKey ? (
              <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-400 shrink-0">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Your API key</span>
                </div>
                <div className="font-mono text-[13px] text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-900 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2 break-all select-all">
                  {apiKey}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">Save this key. It will not be shown again.</p>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="flex-1 text-sm px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="flex-1 text-sm px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
                />
                <button
                  type="submit"
                  disabled={registering}
                  className="text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-emerald-950 px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60 shrink-0"
                >
                  {registering ? "Generating..." : "Get key"}
                </button>
              </form>
            )}
            {registerError && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 mt-3">{registerError}</div>
            )}
          </div>

          {/* Endpoints */}
          <h2 className="text-[16px] font-medium text-neutral-900 dark:text-neutral-100 mb-3 tracking-tight">2. Endpoints</h2>
          <div className="space-y-3 mb-8">
            {ENDPOINTS.map((ep) => (
              <div key={ep.path} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveEndpoint(activeEndpoint === ep.path ? null : ep.path)}
                  className="w-full flex items-center gap-3 px-4 sm:px-5 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    ep.method === "GET" ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950" : "text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950"
                  }`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-[12px] sm:text-[13px] text-neutral-900 dark:text-neutral-100 font-medium">
                    {ep.path}
                  </span>
                  <span className="hidden sm:inline text-xs text-neutral-500 dark:text-neutral-400 flex-1 truncate">{ep.desc}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-neutral-400 transition-transform shrink-0 ${activeEndpoint === ep.path ? "rotate-180" : ""}`}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {activeEndpoint === ep.path && (
                  <div className="px-4 sm:px-5 pb-4 border-t border-neutral-100 dark:border-neutral-800">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-3 mb-3">{ep.desc}</p>
                    {ep.params.length > 0 && (
                      <div className="mb-3">
                        <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">Parameters</div>
                        <div className="space-y-1">
                          {ep.params.map((p) => (
                            <div key={p.name} className="flex items-start gap-2 text-xs">
                              <span className="font-mono text-neutral-900 dark:text-neutral-100 font-medium shrink-0">{p.name}</span>
                              <span className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1 rounded shrink-0">{p.type}</span>
                              <span className="text-neutral-500 dark:text-neutral-400">{p.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-x-auto">
                      <pre className="font-mono text-[11px] sm:text-[11px] text-neutral-700 dark:text-neutral-300 leading-relaxed p-3 sm:p-4 whitespace-pre-wrap break-all">{ep.example}</pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Code Examples */}
          <h2 className="text-[16px] font-medium text-neutral-900 dark:text-neutral-100 mb-3 tracking-tight">3. Code examples</h2>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden mb-8">
            <div className="flex border-b border-neutral-200 dark:border-neutral-800">
              {["curl", "python", "javascript"].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setActiveCode(lang)}
                  className={`flex-1 text-xs sm:text-xs font-medium py-2.5 px-3 transition-colors ${
                    activeCode === lang
                      ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30"
                      : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
                  }`}
                >
                  {lang === "javascript" ? "JavaScript" : lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>
            <pre className="font-mono text-[11px] sm:text-[12px] text-neutral-700 dark:text-neutral-300 leading-relaxed p-4 sm:p-5 overflow-x-auto">
              {CODE_EXAMPLES[activeCode as keyof typeof CODE_EXAMPLES]}
            </pre>
          </div>

          {/* Response Format */}
          <h2 className="text-[16px] font-medium text-neutral-900 dark:text-neutral-100 mb-3 tracking-tight">4. Response format</h2>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 mb-8">
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1 rounded shrink-0 mt-0.5">data</span>
                <span className="text-neutral-500 dark:text-neutral-400">Array of result objects or single object for detail endpoints.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1 rounded shrink-0 mt-0.5">total</span>
                <span className="text-neutral-500 dark:text-neutral-400">Total number of results across all pages.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1 rounded shrink-0 mt-0.5">page</span>
                <span className="text-neutral-500 dark:text-neutral-400">Current page number.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1 rounded shrink-0 mt-0.5">limit</span>
                <span className="text-neutral-500 dark:text-neutral-400">Results per page (max 100).</span>
              </div>
            </div>
          </div>

          {/* Rate Limits */}
          <div className="bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">Rate limits</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              1,000 requests per day per API key. Limit resets at midnight UTC. If you need more, email us at{" "}
              <a href="mailto:api@goha.et" className="text-emerald-600 dark:text-emerald-400 underline">api@goha.et</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
