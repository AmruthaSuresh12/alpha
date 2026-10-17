export interface ServerConfig {
  resendApiKey: string;
  fromEmail: string;
  toEmail: string;
  sendStudentConfirmation: boolean;
  allowedOrigins: string[];
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

export function readServerConfig(): ServerConfig {
  const extraOrigins = (process.env.REGISTRATION_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    resendApiKey: required("RESEND_API_KEY"),
    fromEmail: required("REGISTRATION_FROM_EMAIL"),
    toEmail: required("REGISTRATION_TO_EMAIL"),
    sendStudentConfirmation: process.env.REGISTRATION_SEND_STUDENT_CONFIRMATION === "true",
    allowedOrigins: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      ...extraOrigins,
    ],
  };
}

export function isAllowedOrigin(origin: string | undefined, allowed: string[]): boolean {
  if (!origin) return true;
  return allowed.includes(origin);
}
