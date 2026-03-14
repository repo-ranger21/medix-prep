import Link from "next/link";
import { Activity, Brain, Zap, Shield, BookOpen, Trophy, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";

function EcgLine() {
  return (
    <svg className="w-full absolute bottom-0 left-0 opacity-15" viewBox="0 0 1200 100" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <polyline points="0,50 100,50 120,50 140,10 160,90 180,50 220,50 240,20 260,80 280,50 350,50 370,50 390,10 410,90 430,50 500,50 520,20 540,80 560,50 650,50 670,50 690,10 710,90 730,50 800,50 820,20 840,80 860,50 950,50 970,50 990,10 1010,90 1030,50 1100,50 1120,20 1140,80 1160,50 1200,50" stroke="#3B82F6" strokeWidth="2" fill="none" />
    </svg>
  );
}

const FEATURES = [
  { icon: Brain, title: "ARIA AI Tutor", description: "Protocol-verified AI with 3-layer safety. Never hallucinates drug doses.", color: "text-blue-400", bg: "bg-blue-500/10" },
  { icon: Zap, title: "FSRS-6 Spaced Repetition", description: "Three retention tiers by criticality. Life-critical content at 95% retention.", color: "text-amber-400", bg: "bg-amber-500/10" },
  { icon: Shield, title: "2025 AHA Guidelines", description: "All content updated to AHA 2025 BLS. Infant two-finger elimination, 6-link chain.", color: "text-green-400", bg: "bg-green-500/10" },
  { icon: BookOpen, title: "UWorld-Quality Questions", description: "Per-distractor explanations, clinical reasoning, and protocol references.", color: "text-purple-400", bg: "bg-purple-500/10" },
  { icon: Trophy, title: "Clinical Scenarios", description: "Branching patient simulations with real-time parameter changes.", color: "text-orange-400", bg: "bg-orange-500/10" },
  { icon: TrendingUp, title: "Mastery Analytics", description: "Topic-by-topic mastery heatmap, retention curves, and XP leaderboards.", color: "text-cyan-400", bg: "bg-cyan-500/10" },
];

const STATS = [
  { value: "2,300+", label: "NREMT Questions" },
  { value: "95%", label: "Life-Critical Retention" },
  { value: "2025", label: "AHA Guidelines" },
  { value: "3-Layer", label: "AI Safety Architecture" },
];

const PRICING = [
  {
    name: "Free", price: "$0", period: "", description: "Get started with core features",
    features: ["50 flashcards/day", "Basic ARIA chat", "Topic mastery tracking", "Core EMT questions"],
    cta: "Get Started Free", href: "/signup", highlight: false,
  },
  {
    name: "Individual", price: "$29", period: "/mo", description: "Full platform access",
    features: ["Unlimited flashcards", "Full ARIA tutor (all modes)", "Clinical scenarios", "All cert levels", "Advanced analytics", "Priority support"],
    cta: "Start Free Trial", href: "/signup?plan=individual", highlight: true,
  },
  {
    name: "Institutional", price: "Custom", period: "", description: "For EMS programs & academies",
    features: ["Everything in Individual", "Cohort analytics", "Custom content upload", "Marketplace revenue split", "LMS integration", "Dedicated support"],
    cta: "Contact Us", href: "mailto:hello@medixprep.com", highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F1F5F9]">
      <nav className="sticky top-0 z-50 bg-[#0B1120]/80 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 flex items-center h-14 gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">MedixPrep</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 text-sm text-[#94A3B8] hover:text-white transition-colors">Sign in</Link>
            <Link href="/signup" className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.15), transparent)" }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-xs font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            Now with AHA 2025 BLS Guidelines
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-6">
            The UWorld<br />for NREMT
          </h1>
          <p className="text-xl text-[#94A3B8] max-w-2xl mx-auto mb-8 leading-relaxed">
            AI-powered EMS certification prep with protocol-verified guidance, FSRS-6 spaced repetition, and clinical scenarios.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link href="/signup" className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium text-base transition-colors">
              Start Studying Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="px-6 py-3 rounded-lg text-[#94A3B8] hover:text-white border border-white/10 hover:bg-white/5 text-base transition-colors">
              Sign In
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-bold text-2xl text-white">{stat.value}</div>
                <div className="text-xs text-[#94A3B8]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative mt-12 h-16"><EcgLine /></div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Built for real EMS education</h2>
            <p className="text-[#94A3B8] max-w-xl mx-auto">Not a chatbot with a medical skin. Every clinical value traces to verified protocol constants.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-5 rounded-xl border border-white/5 bg-[#0F172A] hover:border-blue-500/20 transition-all group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.bg}`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">{f.title}</h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-[#0F172A] border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Three-Layer AI Architecture</h2>
            <p className="text-[#94A3B8] text-sm">Safety by design — not by prompt engineering</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { num: "01", title: "Protocol Engine", desc: "TypeScript constants. Deterministic. No LLM. Drug doses, CPR parameters, and protocols are hardcoded — never generated.", color: "text-green-400", border: "border-green-500/20" },
              { num: "02", title: "RAG Pipeline", desc: "Hybrid semantic+BM25 search over embedded AHA 2025 guidelines. MMR reranking for diverse, relevant context.", color: "text-blue-400", border: "border-blue-500/20" },
              { num: "03", title: "Guardian Validator", desc: "GPT-4o-mini validates every response for wrong doses, scope violations, and hallucinated facts before delivery.", color: "text-amber-400", border: "border-amber-500/20" },
            ].map((layer) => (
              <div key={layer.num} className={`p-5 rounded-xl border bg-[#0B1120] ${layer.border}`}>
                <div className={`font-mono font-bold text-2xl mb-2 ${layer.color}`}>{layer.num}</div>
                <h3 className="font-bold text-white mb-2">{layer.title}</h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed">{layer.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Simple pricing</h2>
            <p className="text-[#94A3B8]">Start free. Upgrade when you&apos;re ready to go all-in.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {PRICING.map((plan) => (
              <div key={plan.name} className={`p-6 rounded-xl border flex flex-col ${plan.highlight ? "border-blue-500/40 bg-gradient-to-b from-blue-500/10 to-[#0F172A] ring-1 ring-blue-500/20" : "border-white/5 bg-[#0F172A]"}`}>
                {plan.highlight && (
                  <div className="text-center mb-3">
                    <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium">Most Popular</span>
                  </div>
                )}
                <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                <div className="flex items-baseline gap-1 my-2">
                  <span className="font-black text-3xl text-white">{plan.price}</span>
                  {plan.period && <span className="text-[#94A3B8] text-sm">{plan.period}</span>}
                </div>
                <p className="text-[#94A3B8] text-sm mb-4">{plan.description}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-[#94A3B8]">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`text-center py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${plan.highlight ? "bg-blue-500 hover:bg-blue-600 text-white" : "border border-white/10 hover:bg-white/5 text-[#94A3B8] hover:text-white"}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-black text-white mb-4">Ready to pass NREMT?</h2>
          <p className="text-[#94A3B8] mb-8 text-lg">Join EMS candidates studying smarter with protocol-verified AI.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-lg px-8 py-4 rounded-lg font-medium transition-colors">
            Start Studying Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-white">MedixPrep</span>
          </div>
          <p className="text-[#475569] text-xs text-center max-w-sm">
            ⚠️ Educational purposes only. Always follow your local EMS protocols and medical direction.
          </p>
          <div className="flex gap-4 text-xs text-[#475569]">
            <Link href="/privacy" className="hover:text-[#94A3B8]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#94A3B8]">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
