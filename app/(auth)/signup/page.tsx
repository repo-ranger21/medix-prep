"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Activity, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";

type CertLevel = "BLS" | "EMR" | "EMT" | "AEMT" | "Paramedic";

const CERT_LEVELS: Array<{
  level: CertLevel;
  label: string;
  description: string;
  icon: string;
}> = [
  { level: "BLS", label: "BLS Provider", description: "CPR & Basic Life Support", icon: "💓" },
  { level: "EMR", label: "EMR", description: "Emergency Medical Responder", icon: "🏥" },
  { level: "EMT", label: "EMT-Basic", description: "Emergency Medical Technician", icon: "🚑" },
  { level: "AEMT", label: "AEMT", description: "Advanced EMT", icon: "💉" },
  { level: "Paramedic", label: "Paramedic", description: "Paramedic / EMT-P", icon: "⚡" },
];

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [certLevel, setCertLevel] = useState<CertLevel>("EMT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setError(null);
    setStep(2);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName, cert_level: certLevel },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-2">Check your email</h1>
          <p className="text-[#94A3B8]">
            We&apos;ve sent a confirmation link to <strong className="text-white">{email}</strong>.
            Click the link to activate your account.
          </p>
          <Link href="/login" className="btn-ghost mt-6 inline-flex">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">MedixPrep</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Create your account</h1>
          <p className="text-[#94A3B8] mt-1">Step {step} of 2</p>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-all ${
                s <= step ? "bg-blue-500" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="card">
          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input pl-10"
                    placeholder="Alex Johnson"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-10"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-10"
                    placeholder="Min 8 characters"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full">
                Continue
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-3">
                  Select your certification level
                </label>
                <div className="space-y-2">
                  {CERT_LEVELS.map((c) => (
                    <button
                      key={c.level}
                      type="button"
                      onClick={() => setCertLevel(c.level)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                        certLevel === c.level
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <span className="text-2xl">{c.icon}</span>
                      <div>
                        <div className="font-medium text-white text-sm">{c.label}</div>
                        <div className="text-[#94A3B8] text-xs">{c.description}</div>
                      </div>
                      {certLevel === c.level && (
                        <CheckCircle className="w-4 h-4 text-blue-400 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-ghost flex-1"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create account"}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-[#94A3B8] text-sm mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
