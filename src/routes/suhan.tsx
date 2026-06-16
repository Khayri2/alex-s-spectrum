import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import FluidBackground from "@/components/FluidBackground";

export const Route = createFileRoute("/suhan")({
  component: SuhanPage,
  head: () => ({
    meta: [
      { title: "Suhan — Thirteen. From India. Unfinished." },
      {
        name: "description",
        content:
          "Portfolio of Suhan, a 13-year-old builder, thinker, and creator from India. Code, chess, cricket, music, and curiosity at full volume.",
      },
    ],
  }),
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
    let rx = 0,
      ry = 0,
      dx = 0,
      dy = 0,
      raf = 0;
    const move = (e: MouseEvent) => {
      dx = e.clientX;
      dy = e.clientY;
      if (dot.current)
        dot.current.style.transform = `translate(${dx}px,${dy}px) translate(-50%,-50%)`;
    };
    const tick = () => {
      rx += (dx - rx) * 0.18;
      ry += (dy - ry) * 0.18;
      if (ring.current)
        ring.current.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
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
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-2 w-2 rounded-full bg-[#ff8a1a] mix-blend-difference hidden md:block"
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
  { key: "github", label: "GitHub", placeholder: "https://github.com/yourname", url: "" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/yourname", url: "" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourchannel", url: "" },
  { key: "chesscom", label: "Chess.com", placeholder: "https://chess.com/member/yourname", url: "" },
  { key: "twitter", label: "Twitter / X", placeholder: "https://x.com/yourhandle", url: "" },
  { key: "spotify", label: "Spotify", placeholder: "https://open.spotify.com/user/...", url: "" },
  { key: "email", label: "Email", placeholder: "you@example.com", url: "" },
];

/* ───────────── page ───────────── */

function SuhanPage() {
  const root = useReveal<HTMLDivElement>();

  const [links, setLinks] = useState(DEFAULT_LINKS);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("suhan.links");
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, string>;
        setLinks((prev) => prev.map((l) => ({ ...l, url: saved[l.key] ?? "" })));
      }
    } catch {}
  }, []);

  useEffect(() => {
    const map: Record<string, string> = {};
    links.forEach((l) => (map[l.key] = l.url));
    try {
      localStorage.setItem("suhan.links", JSON.stringify(map));
    } catch {}
  }, [links]);

  const updateLink = (key: string, url: string) =>
    setLinks((p) => p.map((l) => (l.key === key ? { ...l, url } : l)));

  const hrefFor = (l: { key: string; url: string }) => {
    if (!l.url) return undefined;
    if (l.key === "email") return l.url.includes("@") ? `mailto:${l.url}` : undefined;
    return /^https?:\/\//i.test(l.url) ? l.url : `https://${l.url}`;
  };

  // Suhan-specific accent (saffron)
  return (
    <div
      ref={root}
      className="min-h-screen text-[var(--bone)] font-sans relative"
      style={{ ["--accent" as never]: "#ff8a1a" }}
    >
      <Cursor />
      <FluidBackground />

      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-10 py-6 mix-blend-difference">
        <a href="#top" className="flex items-center gap-3 text-[10px] tracking-[0.32em] uppercase">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
          Suhan<span className="opacity-40">®</span>
        </a>
        <ul className="hidden md:flex items-center gap-8 text-[10px] tracking-[0.3em] uppercase">
          <li><a href="#about" className="opacity-60 hover:opacity-100 transition">About</a></li>
          <li><a href="#work" className="opacity-60 hover:opacity-100 transition">Work</a></li>
          <li><a href="#skills" className="opacity-60 hover:opacity-100 transition">Skills</a></li>
          <li><a href="#links" className="opacity-60 hover:opacity-100 transition">Links</a></li>
          <li><a href="#contact" className="opacity-60 hover:opacity-100 transition">Contact</a></li>
        </ul>
        <div className="text-[10px] tracking-[0.3em] uppercase opacity-60">
          <span className="hidden sm:inline">2026 —</span> IN / IST
        </div>
      </nav>

      {/* HERO */}
      <section
        id="top"
        className="relative min-h-screen flex flex-col justify-end px-6 md:px-10 pb-10 pt-32"
      >
        <div className="absolute top-1/3 right-6 md:right-10 max-w-[260px] text-[11px] leading-relaxed tracking-wide opacity-60 reveal hidden md:block">
          <span className="text-[var(--accent)]">●</span> A portfolio for a 13-year-old from India who treats curiosity like a contact sport.
        </div>

        <div className="grid grid-cols-12 gap-4 items-end">
          <div className="col-span-12 md:col-span-8">
            <div className="text-[10px] tracking-[0.4em] uppercase text-[var(--accent)] mb-6 reveal">
              ⌁ Index / 002 — Suhan, India
            </div>
            <h1 className="font-serif italic leading-[0.85] tracking-[-0.04em] text-[clamp(4.5rem,17vw,16rem)]">
              <span className="mask-line"><span>Soft-spoken.</span></span>
              <span className="mask-line"><span>Loud<span className="text-[var(--accent)]">/</span>work.</span></span>
              <span className="mask-line"><span>thirteen.</span></span>
            </h1>
          </div>
          <div className="col-span-12 md:col-span-4 md:pb-6">
            <p className="text-sm leading-relaxed opacity-60 max-w-sm reveal">
              I write code at 2am. I read books I'm "not supposed to". I play chess
              like it owes me money. I'm building things I'll be embarrassed by next year — and that's the point.
              <span className="block mt-3 text-[var(--bone)]">I'm 13. The runway is long.</span>
            </p>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-[var(--dim)] flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-wrap gap-2">
            {["Builder", "Chess Player", "Writer", "Cricket Tragic", "Self-taught Dev", "Reader"].map((t, i) => (
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
              {["Code", "Chess", "Cricket", "Music", "Books", "Design", "India", "Curiosity"].map((w, i) => (
                <span
                  key={`${k}-${i}`}
                  className="font-serif italic text-3xl md:text-4xl px-8 opacity-30"
                >
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
              A small human, building loud.
            </h2>
            <p className="text-base md:text-lg leading-[1.8] opacity-60 max-w-lg reveal">
              I'm Suhan — thirteen, from India, and stubbornly curious.
              I taught myself to code from YouTube and forum threads at midnight.
              I lose chess games on purpose so I learn the lines my opponents trust.
              I write essays no one asked for. I am not a prodigy — I am a kid who refuses
              to be bored. There is a difference, and I prefer mine.
            </p>
          </div>
          <div className="md:mt-12">
            {[
              { n: "13", d: "Years Old" },
              { n: "IN", d: "Based in India" },
              { n: "∞", d: "Late-night Tabs" },
              { n: "01", d: "First Real Site" },
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

      {/* WORK */}
      <section id="work" className="px-6 md:px-10 py-28 md:py-40 border-b border-[var(--dim)]">
        <SectionLabel n="02" title="Disciplines" />
        <div className="grid md:grid-cols-2 gap-px bg-[var(--dim)] border border-[var(--dim)] mt-12">
          {[
            { n: "01", t: "Code", d: "JavaScript, Python, a little Rust when I'm feeling brave. I ship small things, often. Bugs are tuition.", tag: "Self-taught" },
            { n: "02", t: "Chess", d: "Hours on Chess.com. The board is the cheapest gym for a mind. Tactics over feelings, always.", tag: "Daily" },
            { n: "03", t: "Cricket", d: "Born in India — cricket isn't a hobby, it's the weather. Mid-off, late cut, last-ball nerves.", tag: "Field" },
            { n: "04", t: "Writing", d: "Essays, notes, half-finished short stories. If I can't write it clearly, I don't understand it yet.", tag: "Notebook" },
            { n: "05", t: "Music", d: "Headphones-on, world-off. Lo-fi for code, A.R. Rahman for everything else, hip-hop for the gym I don't go to.", tag: "Daily fuel" },
            { n: "06", t: "Design", d: "Type, grids, whitespace. I redesign apps I love just to see if I can do it better. (Usually I can't. Yet.)", tag: "In progress" },
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
          I am thirteen.
          <br />I have nothing to prove and <span className="not-italic text-[var(--accent)]">everything</span> to make.
        </p>
      </section>

      {/* SKILLS */}
      <section id="skills" className="px-6 md:px-10 py-28 md:py-40 border-b border-[var(--dim)]">
        <SectionLabel n="03" title="Capabilities" />
        <div className="mt-12">
          {[
            { n: "Curiosity", p: 99 },
            { n: "Code (JS / Python)", p: 78 },
            { n: "Chess", p: 82 },
            { n: "Writing", p: 70 },
            { n: "Design Eye", p: 72 },
            { n: "Cricket Tragic Energy", p: 100 },
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
                  <span className="text-[10px] tracking-[0.3em] uppercase opacity-50">
                    — {String(i + 1).padStart(2, "0")} / {l.label}
                  </span>
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
          Send a <span className="text-[var(--accent)]">message.</span>
          <br />
          I read <em className="not-italic">everything.</em>
        </h2>
        <div className="mt-14 pt-8 border-t border-[var(--dim)] flex flex-wrap items-end justify-between gap-6">
          <p className="text-sm leading-relaxed opacity-50 max-w-md">
            Project ideas, weird book recs, chess puzzles, or a cricket take you
            need to argue with someone — I'm in.
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
        <span>Suhan — India</span>
        <span className="hidden md:inline">Builder · Thinker · Thirteen</span>
        <span>© 2026 ✦ Still loading</span>
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