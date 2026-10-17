import { Resend } from "resend";
import {
  LIMITS,
  validateRegistration,
  type RegistrationPayload,
} from "../src/lib/registration/schema.ts";
import {
  buildRegistrationEmail,
  buildStudentConfirmationEmail,
} from "./email-template.ts";
import { isAllowedOrigin, readServerConfig } from "./env.ts";
import { consumeRateLimit } from "./rate-limit.ts";

export interface RegisterResult {
  status: number;
  body: {
    ok: boolean;
    message: string;
    errors?: Record<string, string>;
  };
}

export interface RegisterMeta {
  ip: string;
  origin?: string;
}

function clientError(message: string, errors?: Record<string, string>): RegisterResult {
  return { status: 400, body: { ok: false, message, errors } };
}

export async function handleRegister(input: unknown, meta: RegisterMeta): Promise<RegisterResult> {
  let config;
  try {
    config = readServerConfig();
  } catch {
    console.error("registration_misconfigured");
    return {
      status: 503,
      body: {
        ok: false,
        message: "Registration is temporarily unavailable. Please try again later.",
      },
    };
  }

  if (!isAllowedOrigin(meta.origin, config.allowedOrigins)) {
    return clientError("This request could not be verified. Refresh the page and try again.");
  }

  const source = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const honeypot = typeof source.website === "string" ? source.website.trim() : "";
  if (honeypot.length > 0) {
    return {
      status: 200,
      body: { ok: true, message: "Thanks. If this request is genuine, the team will review it." },
    };
  }

  const startedAt = Number(source.formStartedAt);
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < LIMITS.minFillMs) {
    return clientError("Please take a moment to complete the form, then submit again.");
  }

  const ipLimit = consumeRateLimit(`ip:${meta.ip}`, 5, 15 * 60 * 1000);
  if (!ipLimit.ok) {
    return {
      status: 429,
      body: {
        ok: false,
        message: "Too many attempts from this network. Please wait a few minutes and try again.",
      },
    };
  }

  const parsed = validateRegistration(source);
  if (!parsed.ok) {
    return {
      status: 400,
      body: {
        ok: false,
        message: "Please correct the highlighted fields.",
        errors: parsed.errors,
      },
    };
  }

  const emailLimit = consumeRateLimit(
    `email:${parsed.data.institutionalEmail}`,
    1,
    10 * 60 * 1000,
  );
  if (!emailLimit.ok) {
    return {
      status: 429,
      body: {
        ok: false,
        message: "This email was already used recently. Please wait before submitting again.",
      },
    };
  }

  return sendNotification(parsed.data, config);
}

async function sendNotification(
  payload: RegistrationPayload,
  config: ReturnType<typeof readServerConfig>,
): Promise<RegisterResult> {
  const submittedAt = new Date();
  const email = buildRegistrationEmail(payload, submittedAt);
  const resend = new Resend(config.resendApiKey);

  const { error } = await resend.emails.send({
    from: config.fromEmail,
    to: [config.toEmail],
    replyTo: payload.institutionalEmail,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });

  if (error) {
    console.error("registration_delivery_failed");
    return {
      status: 502,
      body: {
        ok: false,
        message: "We could not deliver your form just now. Please try again in a few minutes.",
      },
    };
  }

  if (config.sendStudentConfirmation) {
    const confirm = buildStudentConfirmationEmail(payload.fullName);
    const confirmation = await resend.emails.send({
      from: config.fromEmail,
      to: [payload.institutionalEmail],
      subject: confirm.subject,
      html: confirm.html,
      text: confirm.text,
    });
    if (confirmation.error) {
      console.error("registration_student_confirm_failed");
    }
  }

  return {
    status: 200,
    body: {
      ok: true,
      message:
        "Your interest form was delivered to the Alpha inbox. This is not membership approval. The team will follow up if there is a next step.",
    },
  };
}
