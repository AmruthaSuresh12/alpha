import { JoinForm } from "../features/registration/JoinForm";

export function JoinPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <section>
        <p className="font-mono text-xs text-brand-blue">Join Alpha</p>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-brand-blue-deep">
          Student interest form
        </h1>
        <p className="mt-4 leading-relaxed text-muted">
          Share your details if you want to be considered for club membership, event participation,
          or both. Submitting this form is an expression of interest, not an offer of membership.
        </p>
        <p className="mt-4 leading-relaxed text-muted">
          In this first version, completed forms are emailed to the Alpha inbox. There is no
          registration database or admin dashboard yet, so keep a labelled copy of incoming mail.
        </p>
      </section>
      <JoinForm />
    </div>
  );
}
