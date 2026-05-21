import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

/* ───────────── helpers ───────────── */

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    el.querySelectorAll(".reveal, .mask-line").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}

function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let rx = 0, ry = 0, dx = 0, dy = 0, raf = 0;
    const move = (e: MouseEvent) => {
      dx = e.clientX; dy = e.clientY;
      if (dot.current) dot.current.style.transform = `translate(${dx}px,${dy}px) translate(-50%,-50%)`;
    };
    const tick = () => {
      rx += (dx - rx) * 0.18;
      ry += (dy - ry) * 0.18;
      if (ring.current) ring.current.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(tick);
    };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const interactive = t.closest("a,button,input,textarea,[data-cursor]");
      ring.current?.classList.toggle("scale-[2.2]", !!interactive);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <>
      <div
        ref={dot}
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-2 w-2 rounded-full bg-[var(--accent)] mix-blend-difference hidden md:block"
      />
      <div
        ref={ring}
        className="pointer-events-none fixed top-0 left-0 z-[9998] h-10 w-10 rounded-full border border-[var(--bone)]/40 transition-transform duration-200 ease-out hidden md:block"
      />
    </>
  );
}

/* ───────────── data ───────────── */

const DEFAULT_LINKS: { key: string; label: string; placeholder: string; url: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourhandle", url: "" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/yourname", url: "" },
  { key: "twitter", label: "Twitter / X", placeholder: "https://x.com/yourhandle", url: "" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourchannel", url: "" },
  { key: "github", label: "GitHub", placeholder: "https://github.com/yourname", url: "" },
  { key: "email", label: "Email", placeholder: "you@example.com", url: "" },
];

/* ───────────── page ───────────── */

function Index() {
  const root = useReveal<HTMLDivElement>();

  // editable social links — persisted to localStorage
  const [links, setLinks] = useState(DEFAULT_LINKS);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("alex.links");
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, string>;
        setLinks((prev) => prev.map((l) => ({ ...l, url: saved[l.key] ?? "" })));
      }
    } catch {}
  }, []);

  useEffect(() => {
    const map: Record<string, string> = {};
    links.forEach((l) => (map[l.key] = l.url));
    try { localStorage.setItem("alex.links", JSON.stringify(map)); } catch {}
  }, [links]);

  const updateLink = (key: string, url: string) =>
    setLinks((p) => p.map((l) => (l.key === key ? { ...l, url } : l)));

  const hrefFor = (l: { key: string; url: string }) => {
    if (!l.url) return undefined;
    if (l.key === "email") return l.url.includes("@") ? `mailto:${l.url}` : undefined;
    return /^https?:\/\//i.test(l.url) ? l.url : `https://${l.url}`;
  };

  return (
    <div ref={root} className="min-h-screen bg-[var(--ink)] text-[var(--bone)] font-sans">
      <Cursor />

      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-10 py-6 mix-blend-difference">
        <a href="#top" className="flex items-center gap-3 text-[10px] tracking-[0.32em] uppercase">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
          Alex<span className="opacity-40">®</span>
        </a>
        <ul className="hidden md:flex items-center gap-8 text-[10px] tracking-[0.3em] uppercase">
          <li><a href="#about" className="opacity-60 hover:opacity-100 transition">About</a></li>
          <li><a href="#work" className="opacity-60 hover:opacity-100 transition">Work</a></li>
          <li><a href="#skills" className="opacity-60 hover:opacity-100 transition">Skills</a></li>
          <li><a href="#contact" className="opacity-60 hover:opacity-100 transition">Contact</a></li>
        </ul>
        <div className="text-[10px] tracking-[0.3em] uppercase opacity-60">
          <span className="hidden sm:inline">2026 —</span> CA / EST
        </div>
      </nav>

      {/* HERO */}
      <section id="top" className="relative min-h-screen flex flex-col justify-end px-6 md:px-10 pb-10 pt-32">
        <div className="absolute top-1/3 right-6 md:right-10 max-w-[260px] text-[11px] leading-relaxed tracking-wide opacity-60 reveal hidden md:block">
          <span className="text-[var(--accent)]">●</span> A portfolio for a 16-year-old who refuses to pick a lane — racing one weekend, debating human rights the next.
        </div>

        <div className="grid grid-cols-12 gap-4 items-end">
          <div className="col-span-12 md:col-span-8">
            <div className="text-[10px] tracking-[0.4em] uppercase text-[var(--accent)] mb-6 reveal">
              ⌁ Index / 001 — Alex, Canada
            </div>
            <h1 className="font-serif italic leading-[0.85] tracking-[-0.04em] text-[clamp(4.5rem,17vw,16rem)]">
              <span className="mask-line"><span>The</span></span>
              <span className="mask-line"><span>un<span className="text-[var(--accent)]">/</span>seen</span></span>
              <span className="mask-line"><span>sixteen.</span></span>
            </h1>
          </div>
          <div className="col-span-12 md:col-span-4 md:pb-6">
            <p className="text-sm leading-relaxed opacity-60 max-w-sm reveal">
              I race karts nationally. I debate human rights at the UN. I shoot photos.
              I build websites. I live and breathe Formula 1.
              <span className="block mt-3 text-[var(--bone)]">I'm 16. And I'm just getting started.</span>
            </p>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-[var(--dim)] flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-wrap gap-2">
            {["Go-Kart Racer", "UN Youth Delegate", "Photographer", "F1 Devotee", "Web Developer"].map((t, i) => (
              <span
                key={t}
                style={{ transitionDelay: `${i * 60}ms` }}
                className="reveal text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 border border-[var(--dim)] rounded-full opacity-80 hover:border-[var(--accent)] hover:text-[var(--accent)] transition"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="flex items-end gap-3 text-[10px] tracking-[0.3em] uppercase opacity-50">
            Scroll
            <span className="block w-px h-12 bg-[var(--dim)] overflow-hidden relative">
              <span className="absolute inset-x-0 -top-full h-full bg-[var(--accent)] animate-[scrollDown_1.8s_ease-in-out_infinite]" />
            </span>
          </div>
        </div>

        <style>{`@keyframes scrollDown {0%{top:-100%}100%{top:100%}}`}</style>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-y border-[var(--dim)] py-4">
        <div className="marquee-track flex w-max">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0">
              {["Racing", "Diplomacy", "Photography", "Formula 1", "UN UNHRC", "Web Dev", "Canada"].map((w, i) => (
                <span key={`${k}-${i}`} className="font-serif italic text-3xl md:text-4xl px-8 opacity-30">
                  {w} <span className="text-[var(--accent)] opacity-100 not-italic mx-2">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" className="px-6 md:px-10 py-28 md:py-40 border-b border-[var(--dim)]">
        <SectionLabel n="01" title="About" />
        <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-start mt-12">
          <div>
            <h2 className="font-serif italic text-5xl md:text-7xl leading-[0.95] tracking-[-0.03em] mb-8 reveal">
              Not your average teenager.
            </h2>
            <p className="text-base md:text-lg leading-[1.8] opacity-60 max-w-lg reveal">
              I'm Alex — a 16-year-old from Canada who doesn't do things halfway.
              On the track, I race go-karts at the national level, representing Canada at speed.
              Off it, I represent youth voices as a UN delegate for the UNHRC, arguing for human
              rights on a global stage. Photography is how I see the world. Code is how I shape it.
              And F1 is the language I dream in.
            </p>
          </div>
          <div className="md:mt-12">
            {[
              { n: "16", d: "Years Old" },
              { n: "CA", d: "National Racer" },
              { n: "UN", d: "UNHRC Delegate" },
              { n: "∞", d: "F1 Passion" },
            ].map((s, i) => (
              <div
                key={s.d}
                style={{ transitionDelay: `${i * 100}ms` }}
                className="reveal group flex items-baseline justify-between py-6 border-t border-[var(--dim)] last:border-b transition-all hover:pl-4"
              >
                <span className="font-serif italic text-4xl md:text-5xl text-[var(--accent)]">{s.n}</span>
                <span className="text-[11px] tracking-[0.25em] uppercase opacity-50">{s.d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORK / WHAT I DO */}
      <section id="work" className="px-6 md:px-10 py-28 md:py-40 border-b border-[var(--dim)]">
        <SectionLabel n="02" title="Disciplines" />
        <div className="grid md:grid-cols-2 gap-px bg-[var(--dim)] border border-[var(--dim)] mt-12">
          {[
            { n: "01", t: "Go-Kart Racing", d: "Competing nationally for Canada. Every corner is a calculation, every race is controlled chaos. Speed is the only language I need.", tag: "National" },
            { n: "02", t: "UN Youth Delegate", d: "Representing the next generation at the UNHRC. I debate. I argue. I advocate. Human rights are non-negotiable.", tag: "UNHRC" },
            { n: "03", t: "Photography", d: "Slowing the world down through a lens. I find the extraordinary in the ordinary — one frame at a time.", tag: "Personal" },
            { n: "04", t: "Web Development", d: "Building digital experiences from the ground up. The internet is a canvas. Code is the brush.", tag: "Self-taught" },
            { n: "05", t: "Formula 1", d: "Not just a fan — a student of the sport. The strategy. The engineering. The insane precision at 300 km/h.", tag: "Obsession" },
            { n: "06", t: "Debate", d: "Sharp argument, surgical research, no flinching. The room shifts when the case is built right.", tag: "Competitive" },
          ].map((c, i) => (
            <div
              key={c.n}
              style={{ transitionDelay: `${i * 70}ms` }}
              className="reveal group relative bg-[var(--ink)] p-8 md:p-10 overflow-hidden hover:bg-[var(--ink-2)] transition-colors"
            >
              <div className="flex items-center justify-between mb-10">
                <span className="text-[10px] tracking-[0.25em] text-[var(--accent)]">— {c.n}</span>
                <span className="text-[9px] tracking-[0.2em] uppercase opacity-40 border border-[var(--dim)] rounded-full px-2 py-0.5">{c.tag}</span>
              </div>
              <h3 className="font-serif italic text-3xl md:text-4xl leading-[1.05] tracking-[-0.02em] mb-4">{c.t}</h3>
              <p className="text-sm leading-[1.7] opacity-55 max-w-md">{c.d}</p>
              <span className="absolute bottom-0 left-0 right-0 h-px bg-[var(--accent)] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="px-6 md:px-10 py-28 md:py-44 text-center border-b border-[var(--dim)]">
        <div className="text-[10px] tracking-[0.4em] uppercase text-[var(--accent)] mb-10 reveal">— Manifesto</div>
        <p className="font-serif italic text-4xl md:text-6xl lg:text-7xl leading-[1.1] tracking-[-0.03em] max-w-5xl mx-auto reveal">
          I don't wait for <span className="not-italic text-[var(--accent)]">the green light.</span>
          <br/>I <em className="not-italic">am</em> the green light.
        </p>
      </section>

      {/* SKILLS */}
      <section id="skills" className="px-6 md:px-10 py-28 md:py-40 border-b border-[var(--dim)]">
        <SectionLabel n="03" title="Capabilities" />
        <div className="mt-12">
          {[
            { n: "Racing & Karting", p: 95 },
            { n: "Debating", p: 90 },
            { n: "Diplomacy", p: 88 },
            { n: "Photography", p: 80 },
            { n: "Web Development", p: 75 },
            { n: "F1 Strategy Brain", p: 99 },
          ].map((s, i) => (
            <SkillRow key={s.n} name={s.n} pct={s.p} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* LINKS (editable) */}
      <section id="links" className="px-6 md:px-10 py-28 md:py-40 border-b border-[var(--dim)]">
        <div className="flex items-center justify-between mb-10">
          <SectionLabel n="04" title="Channels" inline />
          <button
            onClick={() => setEditing((e) => !e)}
            className="text-[10px] tracking-[0.25em] uppercase px-4 py-2 border border-[var(--dim)] rounded-full hover:border-[var(--accent)] hover:text-[var(--accent)] transition"
          >
            {editing ? "Done" : "Edit links"}
          </button>
        </div>

        <p className="font-serif italic text-3xl md:text-5xl leading-[1.05] tracking-[-0.03em] max-w-3xl mb-12 reveal">
          Paste your URLs once. The grid lights up.
        </p>

        <div className="grid md:grid-cols-2 gap-px bg-[var(--dim)] border border-[var(--dim)]">
          {links.map((l, i) => {
            const href = hrefFor(l);
            const filled = Boolean(l.url);
            return (
              <div
                key={l.key}
                style={{ transitionDelay: `${i * 60}ms` }}
                className="reveal group bg-[var(--ink)] p-6 md:p-8 transition-colors hover:bg-[var(--ink-2)]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] tracking-[0.3em] uppercase opacity-50">— {String(i + 1).padStart(2, "0")} / {l.label}</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${filled ? "bg-[var(--accent)]" : "bg-[var(--dim)]"}`} />
                </div>

                {editing ? (
                  <input
                    value={l.url}
                    onChange={(e) => updateLink(l.key, e.target.value)}
                    placeholder={l.placeholder}
                    className="w-full bg-transparent font-serif italic text-2xl md:text-4xl tracking-[-0.02em] outline-none placeholder:opacity-25 caret-[var(--accent)] py-2"
                  />
                ) : href ? (
                  <a
                    href={href}
                    target={l.key === "email" ? undefined : "_blank"}
                    rel="noreferrer"
                    className="flex items-end justify-between gap-4 group/link"
                  >
                    <span className="font-serif italic text-2xl md:text-4xl tracking-[-0.02em] truncate group-hover/link:text-[var(--accent)] transition">
                      {l.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </span>
                    <span className="hover-arrow text-2xl md:text-3xl opacity-60">↗</span>
                  </a>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="font-serif italic text-2xl md:text-4xl tracking-[-0.02em] opacity-30 hover:opacity-60 transition text-left w-full"
                  >
                    Add {l.label.toLowerCase()} →
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-[10px] tracking-[0.25em] uppercase opacity-40">
          Stored locally on this device. Refresh-safe.
        </p>
      </section>

      {/* CONTACT */}
      <section id="contact" className="px-6 md:px-10 py-28 md:py-40">
        <SectionLabel n="05" title="Say hello" />
        <h2 className="font-serif italic text-[clamp(3rem,12vw,11rem)] leading-[0.88] tracking-[-0.04em] mt-10 reveal">
          Let's <span className="text-[var(--accent)]">build</span><br />
          something <em className="not-italic">loud.</em>
        </h2>
        <div className="mt-14 pt-8 border-t border-[var(--dim)] flex flex-wrap items-end justify-between gap-6">
          <p className="text-sm leading-relaxed opacity-50 max-w-md">
            Whether you want to talk racing lines, debate global policy,
            or collaborate on something bold — I'm always open.
          </p>
          <a
            href="#links"
            className="text-[10px] tracking-[0.3em] uppercase border border-[var(--dim)] hover:border-[var(--accent)] hover:text-[var(--accent)] rounded-full px-5 py-3 transition flex items-center gap-3"
          >
            See all channels <span className="hover-arrow">↗</span>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 md:px-10 py-6 border-t border-[var(--dim)] flex flex-wrap items-center justify-between gap-4 text-[10px] tracking-[0.3em] uppercase opacity-40">
        <span>Alex — Canada</span>
        <span className="hidden md:inline">Racer · Delegate · Creator</span>
        <span>© 2026 ✦ All systems green</span>
      </footer>
    </div>
  );
}

/* ───────────── sub-components ───────────── */

function SectionLabel({ n, title, inline }: { n: string; title: string; inline?: boolean }) {
  return (
    <div className={`flex items-center gap-4 text-[10px] tracking-[0.3em] uppercase text-[var(--accent)] ${inline ? "" : "mb-2"}`}>
      <span>{n}</span>
      <span className="opacity-60">/</span>
      <span className="opacity-80">{title}</span>
      {!inline && <span className="flex-1 h-px bg-[var(--dim)]" />}
    </div>
  );
}

function SkillRow({ name, pct, delay }: { name: string; pct: number; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setTimeout(() => setWidth(pct), delay);
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pct, delay]);
  return (
    <div
      ref={ref}
      className="group flex items-center justify-between gap-6 py-7 border-t border-[var(--dim)] last:border-b transition-all hover:pl-4"
    >
      <span className="font-serif italic text-2xl md:text-4xl tracking-[-0.02em] group-hover:text-[var(--accent)] transition">{name}</span>
      <div className="flex items-center gap-4 flex-1 max-w-xs">
        <div className="relative flex-1 h-px bg-[var(--dim)]">
          <div
            className="absolute inset-y-0 left-0 bg-[var(--accent)] transition-[width] duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)]"
            style={{ width: `${width}%` }}
          />
        </div>
        <span className="text-[11px] font-mono opacity-50 w-10 text-right">{pct}</span>
      </div>
    </div>
  );
}