import {
  interestTypeLabel,
  type RegistrationPayload,
} from "../src/lib/registration/schema.ts";
import { escapeHtml } from "./html.ts";

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #D9DEE6;width:180px;vertical-align:top;font:600 13px/1.4 'Segoe UI',sans-serif;color:#122A66;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #D9DEE6;vertical-align:top;font:400 14px/1.5 'Segoe UI',sans-serif;color:#121826;white-space:pre-wrap;">
        ${escapeHtml(value)}
      </td>
    </tr>`;
}

export function registrationEmailSubject(): string {
  return "New Alpha Membership Registration";
}

export function buildRegistrationEmail(payload: RegistrationPayload, submittedAt: Date): {
  subject: string;
  html: string;
  text: string;
} {
  const submittedDisplay = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "full",
    timeStyle: "long",
    timeZone: "Asia/Kolkata",
  }).format(submittedAt);

  const intent = interestTypeLabel(payload.interestType);
  const membership =
    payload.interestType === "events"
      ? "No — event participation only"
      : "Yes — interested in club membership";
  const events =
    payload.interestType === "membership"
      ? "No — membership only"
      : "Yes — interested in event participation";

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#F5F6F8;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F5F6F8;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;background:#ffffff;border:1px solid #D9DEE6;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:#122A66;padding:20px 24px;color:#ffffff;font:600 16px/1.3 'Segoe UI',sans-serif;">
                ALPHA Innovation and Tinkerers' Lab
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 8px;font:600 18px/1.3 'Segoe UI',sans-serif;color:#121826;">
                  New student registration
                </p>
                <p style="margin:0 0 20px;font:400 13px/1.5 'Segoe UI',sans-serif;color:#5C6B80;">
                  This message is a notification only. It is not a searchable membership database.
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${row("Submitted", submittedDisplay)}
                  ${row("Full name", payload.fullName)}
                  ${row("Institutional email", payload.institutionalEmail)}
                  ${row("Department", payload.department)}
                  ${row("Year of study", `Year ${payload.yearOfStudy}`)}
                  ${row("Technical interests", payload.technicalInterests.join(", "))}
                  ${row("Interest type", intent)}
                  ${row("Membership interest", membership)}
                  ${row("Event participation", events)}
                  ${payload.skills ? row("Skills", payload.skills) : ""}
                  ${payload.motivation ? row("Motivation", payload.motivation) : ""}
                </table>
                <p style="margin:20px 0 0;font:400 12px/1.5 'Segoe UI',sans-serif;color:#5C6B80;">
                  Reply to this email to contact the student at their submitted address.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    "New Alpha Membership Registration",
    `Submitted: ${submittedDisplay}`,
    `Full name: ${payload.fullName}`,
    `Institutional email: ${payload.institutionalEmail}`,
    `Department: ${payload.department}`,
    `Year of study: Year ${payload.yearOfStudy}`,
    `Technical interests: ${payload.technicalInterests.join(", ")}`,
    `Interest type: ${intent}`,
    `Membership interest: ${membership}`,
    `Event participation: ${events}`,
    payload.skills ? `Skills: ${payload.skills}` : "",
    payload.motivation ? `Motivation: ${payload.motivation}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return { subject: registrationEmailSubject(), html, text };
}

export function buildStudentConfirmationEmail(name: string): { subject: string; html: string; text: string } {
  const safeName = escapeHtml(name);
  return {
    subject: "We received your Alpha interest form",
    html: `<p>Hello ${safeName},</p>
<p>ALPHA Innovation and Tinkerers' Lab received your interest form. This is a confirmation that the form was delivered to the club inbox. It is not membership approval.</p>
<p>The team will follow up if there is a next step.</p>`,
    text: `Hello ${name},\n\nALPHA Innovation and Tinkerers' Lab received your interest form. This is a confirmation that the form was delivered to the club inbox. It is not membership approval.\n\nThe team will follow up if there is a next step.`,
  };
}
