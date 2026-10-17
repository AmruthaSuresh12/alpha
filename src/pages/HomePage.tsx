import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <section className="max-w-2xl">
      <p className="font-mono text-xs text-brand-blue">NIE Mysuru</p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-brand-blue-deep">
        ALPHA Innovation and Tinkerers' Lab
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        A student space for making, learning, and collaboration. Explore Alpha, then share your
        interest through the registration form.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/join"
          className="rounded-lg bg-brand-red px-4 py-2.5 font-medium text-white hover:bg-brand-red-deep"
        >
          Join the community
        </Link>
      </div>
    </section>
  );
}
