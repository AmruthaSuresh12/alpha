import { useMemo, useState, type FormEvent } from "react";
import {
  DEPARTMENTS,
  INTEREST_TYPES,
  TECHNICAL_INTERESTS,
  YEARS_OF_STUDY,
  validateRegistration,
  type FieldErrors,
  type InterestType,
  type RegistrationPayload,
} from "../../lib/registration/schema";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

const emptyForm: RegistrationPayload = {
  fullName: "",
  institutionalEmail: "",
  department: "",
  yearOfStudy: "",
  technicalInterests: [],
  skills: "",
  motivation: "",
  interestType: "both",
};

export function JoinForm() {
  const formStartedAt = useMemo(() => Date.now(), []);
  const [form, setForm] = useState<RegistrationPayload>(emptyForm);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  function toggleInterest(value: string) {
    setForm((current) => {
      const exists = current.technicalInterests.includes(value);
      return {
        ...current,
        technicalInterests: exists
          ? current.technicalInterests.filter((item) => item !== value)
          : [...current.technicalInterests, value],
      };
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = validateRegistration(form);
    if (!parsed.ok) {
      setErrors(parsed.errors);
      setStatus({ kind: "error", message: "Please correct the highlighted fields." });
      return;
    }

    setErrors({});
    setStatus({ kind: "submitting" });

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          website: honeypot,
          formStartedAt,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string; errors?: FieldErrors }
        | null;

      if (!response.ok || !payload?.ok) {
        if (payload?.errors) setErrors(payload.errors);
        setStatus({
          kind: "error",
          message:
            payload?.message ??
            "We could not deliver your form just now. Please try again in a few minutes.",
        });
        return;
      }

      setStatus({ kind: "success", message: payload.message ?? "Your form was delivered." });
    } catch {
      setStatus({
        kind: "error",
        message: "The form could not reach the server. Check your connection and try again.",
      });
    }
  }

  if (status.kind === "success") {
    return (
      <div className="rounded-xl border border-line bg-paper p-6" role="status">
        <h2 className="font-display text-xl text-brand-blue-deep">Form delivered</h2>
        <p className="mt-3 leading-relaxed text-ink">{status.message}</p>
        <p className="mt-3 text-sm text-muted">
          Alpha currently keeps these submissions in the club inbox. That is not a membership
          dashboard, and email is not guaranteed long-term storage.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6 rounded-xl border border-line bg-paper p-6">
      <div className="absolute -left-[10000px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Company</label>
        <input
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <Field label="Full name" error={errors.fullName} htmlFor="fullName">
        <input
          id="fullName"
          name="fullName"
          autoComplete="name"
          value={form.fullName}
          onChange={(event) => setForm({ ...form, fullName: event.target.value })}
          className={inputClass(errors.fullName)}
        />
      </Field>

      <Field
        label="Institutional email"
        hint="Use your college email if you have one."
        error={errors.institutionalEmail}
        htmlFor="institutionalEmail"
      >
        <input
          id="institutionalEmail"
          name="institutionalEmail"
          type="email"
          autoComplete="email"
          value={form.institutionalEmail}
          onChange={(event) => setForm({ ...form, institutionalEmail: event.target.value })}
          className={inputClass(errors.institutionalEmail)}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Department" error={errors.department} htmlFor="department">
          <select
            id="department"
            name="department"
            value={form.department}
            onChange={(event) => setForm({ ...form, department: event.target.value })}
            className={inputClass(errors.department)}
          >
            <option value="">Select department</option>
            {DEPARTMENTS.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Year of study" error={errors.yearOfStudy} htmlFor="yearOfStudy">
          <select
            id="yearOfStudy"
            name="yearOfStudy"
            value={form.yearOfStudy}
            onChange={(event) => setForm({ ...form, yearOfStudy: event.target.value })}
            className={inputClass(errors.yearOfStudy)}
          >
            <option value="">Select year</option>
            {YEARS_OF_STUDY.map((year) => (
              <option key={year} value={year}>
                Year {year}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Technical interests</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {TECHNICAL_INTERESTS.map((interest) => (
            <label key={interest} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.technicalInterests.includes(interest)}
                onChange={() => toggleInterest(interest)}
              />
              {interest}
            </label>
          ))}
        </div>
        {errors.technicalInterests ? (
          <p className="mt-2 text-sm text-brand-red">{errors.technicalInterests}</p>
        ) : null}
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">I am interested in</legend>
        <div className="space-y-2">
          {INTEREST_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="interestType"
                checked={form.interestType === type}
                onChange={() => setForm({ ...form, interestType: type as InterestType })}
              />
              {type === "membership"
                ? "Club membership"
                : type === "events"
                  ? "Event participation"
                  : "Both membership and events"}
            </label>
          ))}
        </div>
        {errors.interestType ? <p className="mt-2 text-sm text-brand-red">{errors.interestType}</p> : null}
      </fieldset>

      <Field label="Relevant skills (optional)" htmlFor="skills">
        <textarea
          id="skills"
          name="skills"
          rows={3}
          value={form.skills ?? ""}
          onChange={(event) => setForm({ ...form, skills: event.target.value })}
          className={inputClass()}
        />
      </Field>

      <Field label="Why do you want to join? (optional)" htmlFor="motivation">
        <textarea
          id="motivation"
          name="motivation"
          rows={4}
          value={form.motivation ?? ""}
          onChange={(event) => setForm({ ...form, motivation: event.target.value })}
          className={inputClass()}
        />
      </Field>

      {status.kind === "error" ? (
        <p className="rounded-lg border border-brand-red/30 bg-brand-red/5 px-3 py-2 text-sm text-brand-red" role="alert">
          {status.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status.kind === "submitting"}
        className="rounded-lg bg-brand-red px-4 py-2.5 font-medium text-white hover:bg-brand-red-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status.kind === "submitting" ? "Sending…" : "Submit interest form"}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {hint ? <p className="mb-1.5 text-sm text-muted">{hint}</p> : null}
      {children}
      {error ? (
        <p className="mt-1.5 text-sm text-brand-red" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function inputClass(error?: string) {
  return [
    "w-full rounded-lg border bg-paper px-3 py-2.5 text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand-blue",
    error ? "border-brand-red" : "border-line",
  ].join(" ");
}
