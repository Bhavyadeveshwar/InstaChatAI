"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Check } from "lucide-react";

type Step = "name" | "trigger" | "listener" | "review";

export default function NewAutomationPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("name");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    triggerType: "DM" as "DM" | "COMMENT",
    keywords: [] as string[],
    keywordInput: "",
    listenerType: "MESSAGE" as "MESSAGE" | "SMART_AI",
    message: "",
    prompt: "",
    commentReply: "",
  });

  const steps: Step[] = ["name", "trigger", "listener", "review"];
  const stepIndex = steps.indexOf(step);

  const addKeyword = () => {
    const kw = formData.keywordInput.trim().toLowerCase();
    if (kw && !formData.keywords.includes(kw)) {
      setFormData((f) => ({ ...f, keywords: [...f.keywords, kw], keywordInput: "" }));
    }
  };

  const removeKeyword = (kw: string) => {
    setFormData((f) => ({ ...f, keywords: f.keywords.filter((k) => k !== kw) }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
            console.log("Submitting automation...");

      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          triggerType: formData.triggerType,
          keywords: formData.keywords,
          listenerType: formData.listenerType,
          message: formData.message,
          prompt: formData.prompt,
          commentReply: formData.commentReply,
        }),
      });
      const data = await res.json();
      console.log("Response:", data);
      if (data.id) router.push(`/dashboard/automations/${data.id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Create Automation</h1>
      <p className="text-[var(--text-muted)] text-sm mb-8">
        Build a keyword-triggered response flow for Instagram
      </p>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                i < stepIndex
                  ? "bg-[var(--brand)] text-white"
                  : i === stepIndex
                  ? "bg-[var(--brand)] text-white ring-4 ring-[var(--brand-glow)]"
                  : "bg-[var(--surface-card)] text-[var(--text-muted)] border border-[var(--surface-border)]"
              }`}
            >
              {i < stepIndex ? <Check size={14} /> : i + 1}
            </div>
            <span className={`text-sm capitalize ${i === stepIndex ? "text-white" : "text-[var(--text-muted)]"}`}>
              {s}
            </span>
            {i < steps.length - 1 && (
              <ChevronRight size={16} className="text-[var(--surface-border)] ml-1" />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="glass rounded-2xl p-8">
        {/* Step 1: Name */}
        {step === "name" && (
          <div>
            <h2 className="text-lg font-semibold mb-1">Name your automation</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Give it a descriptive name so you can find it later.
            </p>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Free Guide DM Automation"
              className="w-full bg-[var(--surface)] border border-[var(--surface-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand)] transition-colors"
            />
          </div>
        )}

        {/* Step 2: Trigger */}
        {step === "trigger" && (
          <div>
            <h2 className="text-lg font-semibold mb-1">Set up your trigger</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              What should start this automation?
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {(["DM", "COMMENT"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFormData((f) => ({ ...f, triggerType: t }))}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    formData.triggerType === t
                      ? "border-[var(--brand)] bg-[var(--brand)]/10 text-white"
                      : "border-[var(--surface-border)] text-[var(--text-muted)] hover:border-white/20"
                  }`}
                >
                  <span className="font-medium">{t === "DM" ? "💬 Direct Message" : "💭 Comment"}</span>
                  <p className="text-xs mt-1 opacity-70">
                    {t === "DM" ? "Triggered when someone DMs you" : "Triggered on post comments"}
                  </p>
                </button>
              ))}
            </div>

            <label className="text-sm font-medium mb-2 block">Keywords</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={formData.keywordInput}
                onChange={(e) => setFormData((f) => ({ ...f, keywordInput: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                placeholder="Type a keyword and press Enter"
                className="flex-1 bg-[var(--surface)] border border-[var(--surface-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--brand)] transition-colors"
              />
              <button
                onClick={addKeyword}
                className="btn-brand px-4 py-2.5 rounded-xl text-sm font-medium text-white"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.keywords.map((kw) => (
                <span
                  key={kw}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[var(--brand)]/20 border border-[var(--brand)]/30 text-[var(--brand)] rounded-full text-sm"
                >
                  {kw}
                  <button onClick={() => removeKeyword(kw)} className="opacity-60 hover:opacity-100">×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Listener */}
        {step === "listener" && (
          <div>
            <h2 className="text-lg font-semibold mb-1">Choose an action</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              What should happen when the trigger fires?
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {(["MESSAGE", "SMART_AI"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFormData((f) => ({ ...f, listenerType: t }))}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    formData.listenerType === t
                      ? "border-[var(--brand)] bg-[var(--brand)]/10 text-white"
                      : "border-[var(--surface-border)] text-[var(--text-muted)] hover:border-white/20"
                  }`}
                >
                  <span className="font-medium">
                    {t === "MESSAGE" ? "📩 Send Message" : "🤖 Smart AI"}
                  </span>
                  <p className="text-xs mt-1 opacity-70">
                    {t === "MESSAGE"
                      ? "Send a fixed reply"
                      : "Let AI handle the full conversation"}
                  </p>
                </button>
              ))}
            </div>

            {formData.listenerType === "MESSAGE" ? (
              <div>
                <label className="text-sm font-medium mb-2 block">Message to send</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData((f) => ({ ...f, message: e.target.value }))}
                  rows={4}
                  placeholder="Hey! Thanks for reaching out. Here's your free guide: ..."
                  className="w-full bg-[var(--surface)] border border-[var(--surface-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand)] transition-colors resize-none"
                />
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium mb-2 block">AI System Prompt</label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData((f) => ({ ...f, prompt: e.target.value }))}
                  rows={5}
                  placeholder="You are a sales assistant for [Brand]. Your goal is to qualify leads and book discovery calls. Be friendly and concise. Ask about their main challenge first..."
                  className="w-full bg-[var(--surface)] border border-[var(--surface-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand)] transition-colors resize-none"
                />
              </div>
            )}

            {formData.triggerType === "COMMENT" && (
              <div className="mt-4">
                <label className="text-sm font-medium mb-2 block">
                  Public comment reply{" "}
                  <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.commentReply}
                  onChange={(e) => setFormData((f) => ({ ...f, commentReply: e.target.value }))}
                  placeholder="Sent you a DM! 📩"
                  className="w-full bg-[var(--surface)] border border-[var(--surface-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--brand)] transition-colors"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review */}
        {step === "review" && (
          <div>
            <h2 className="text-lg font-semibold mb-6">Review & Create</h2>
            <div className="space-y-4">
              {[
                { label: "Name", value: formData.name },
                { label: "Trigger", value: formData.triggerType },
                { label: "Keywords", value: formData.keywords.join(", ") || "None" },
                { label: "Action", value: formData.listenerType === "MESSAGE" ? "Send Message" : "Smart AI" },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex justify-between items-center py-3 border-b border-[var(--surface-border)] last:border-0"
                >
                  <span className="text-sm text-[var(--text-muted)]">{r.label}</span>
                  <span className="text-sm font-medium">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep(steps[stepIndex - 1])}
          disabled={stepIndex === 0}
          className="px-6 py-2.5 rounded-xl border border-[var(--surface-border)] text-sm text-[var(--text-muted)] disabled:opacity-30 hover:text-white hover:border-white/20 transition-all"
        >
          Back
        </button>

        {step !== "review" ? (
          <button
            onClick={() => setStep(steps[stepIndex + 1])}
            disabled={step === "name" && !formData.name.trim()}
            className="btn-brand px-6 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-40"
          >
            Continue →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-brand px-6 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Automation ✓"}
          </button>
        )}
      </div>
    </div>
  );
}
