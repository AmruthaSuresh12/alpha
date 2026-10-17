import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-canvas text-ink">
      <header className="bg-brand-blue-deep text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-3 text-white no-underline">
            <img
              src="/brand/alpha-logo.jpg"
              alt="ALPHA Innovation and Tinkerers' Lab"
              className="h-11 w-11 rounded-sm bg-white object-contain p-0.5"
            />
            <span className="font-display text-sm tracking-wide">ALPHA</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink to="/" className="text-white/80 hover:text-white">
              Home
            </NavLink>
            <NavLink
              to="/join"
              className="rounded-lg bg-brand-red px-3 py-2 font-medium text-white hover:bg-brand-red-deep"
            >
              Join Alpha
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
      <footer className="bg-brand-blue-deep py-8 text-sm text-white/80">
        <div className="mx-auto max-w-5xl px-4">
          <p>ALPHA Innovation and Tinkerers' Lab · The National Institute of Engineering, Mysuru</p>
          <p className="mt-2">
            <a className="text-white underline" href="https://www.linkedin.com/company/alpha-innovation-and-tinkerers-lab/">
              LinkedIn
            </a>
            <span className="mx-2">·</span>
            <a className="text-white underline" href="https://www.instagram.com/alpha.nie_mysuru/">
              Instagram
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
