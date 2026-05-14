import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <span className="text-xl font-bold gradient-text tracking-tight">
          slide
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/sign-in"
            className="text-sm text-[var(--text-muted)] hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/sign-up"
            className="btn-brand px-4 py-2 rounded-xl text-sm font-medium text-white"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 relative">
        {/* Glow orb */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px] pointer-events-none"
          style={{ background: "rgba(108,71,255,0.12)" }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--surface-border)] bg-[var(--surface-card)] text-xs text-[var(--text-muted)] mb-8">
            <span className="w-2 h-2 rounded-full bg-[var(--brand)] animate-pulse" />
            Instagram Automation, Powered by AI
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            <span className="gradient-text">Reply faster.</span>
            <br />
            Grow smarter.
          </h1>

          <p className="text-lg text-[var(--text-muted)] max-w-xl mx-auto mb-10 leading-relaxed">
            Slide connects to your Instagram and automatically responds to
            comments and DMs when someone uses your keywords. Set it up once,
            let AI close for you.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link
              href="/auth/sign-up"
              className="btn-brand px-8 py-3 rounded-xl font-semibold text-white text-base w-full sm:w-auto"
            >
              Start for free →
            </Link>
            <Link
              href="#how-it-works"
              className="px-8 py-3 rounded-xl border border-[var(--surface-border)] text-sm text-[var(--text-muted)] hover:text-white hover:border-white/20 transition-all w-full sm:w-auto"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="how-it-works"
        className="py-24 px-6 max-w-7xl mx-auto w-full"
      >
        <h2 className="text-3xl font-bold text-center mb-4">
          Three steps to full automation
        </h2>
        <p className="text-[var(--text-muted)] text-center mb-16">
          Every automation is built from the same simple building blocks.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              num: "01",
              title: "Set a Trigger",
              desc: "Choose keywords that activate your automation — from comments on a post or direct messages.",
            },
            {
              num: "02",
              title: "Pick a Listener",
              desc: "Send a fixed message, or let Smart AI take over the conversation as a closer.",
            },
            {
              num: "03",
              title: "Attach a Post",
              desc: "For comment triggers, link the specific post you want to monitor. DMs need no post.",
            },
          ].map((f) => (
            <div
              key={f.num}
              className="glass rounded-2xl p-6 card-hover cursor-default"
            >
              <span className="text-4xl font-bold text-[var(--brand)] opacity-40">
                {f.num}
              </span>
              <h3 className="text-lg font-semibold mt-4 mb-2">{f.title}</h3>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Smart AI CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto glass rounded-3xl p-12 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(108,71,255,0.18) 0%, transparent 70%)",
            }}
          />
          <h2 className="text-3xl font-bold mb-4 relative z-10">
            Smart AI closes deals{" "}
            <span className="gradient-text">while you sleep</span>
          </h2>
          <p className="text-[var(--text-muted)] mb-8 relative z-10">
            Write a prompt. Smart AI handles the full DM conversation — asking
            questions, qualifying leads, and booking calls — all without you
            lifting a finger.
          </p>
          <Link
            href="/auth/sign-up"
            className="btn-brand px-8 py-3 rounded-xl font-semibold text-white inline-block relative z-10"
          >
            Try it free
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--surface-border)] py-8 text-center text-sm text-[var(--text-muted)]">
        © {new Date().getFullYear()} Slide. All rights reserved.
      </footer>
    </main>
  );
}
