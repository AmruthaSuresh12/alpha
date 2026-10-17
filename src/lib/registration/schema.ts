export const DEPARTMENTS = [
  "Computer Science and Engineering",
  "CSE (AI and ML)",
  "Information Science and Engineering",
  "Electronics and Communication Engineering",
  "Electrical and Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Industrial and Production Engineering",
  "Other",
] as const;

export const YEARS_OF_STUDY = ["1", "2", "3", "4"] as const;

export const TECHNICAL_INTERESTS = [
  "AI and ML",
  "Digital fabrication",
  "Prototyping",
  "IoT",
  "Electronics",
  "Other",
] as const;

export const INTEREST_TYPES = ["membership", "events", "both"] as const;

export type Department = (typeof DEPARTMENTS)[number];
export type YearOfStudy = (typeof YEARS_OF_STUDY)[number];
export type TechnicalInterest = (typeof TECHNICAL_INTERESTS)[number];
export type InterestType = (typeof INTEREST_TYPES)[number];

export interface RegistrationPayload {
  fullName: string;
  institutionalEmail: string;
  department: string;
  yearOfStudy: string;
  technicalInterests: string[];
  skills?: string;
  motivation?: string;
  interestType: InterestType;
}

export interface RegistrationRequest extends RegistrationPayload {
  website?: string;
  formStartedAt?: number;
}

export type FieldErrors = Partial<Record<keyof RegistrationPayload, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export const LIMITS = {
  fullName: 100,
  institutionalEmail: 120,
  department: 80,
  skills: 500,
  motivation: 1000,
  technicalInterests: 6,
  minFillMs: 2500,
} as const;

export function sanitizeLine(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(CONTROL_CHARS, "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function sanitizeMultiline(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(CONTROL_CHARS, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim()
    .slice(0, max);
}

function isInterestType(value: unknown): value is InterestType {
  return typeof value === "string" && (INTEREST_TYPES as readonly string[]).includes(value);
}

function isYear(value: unknown): value is YearOfStudy {
  return typeof value === "string" && (YEARS_OF_STUDY as readonly string[]).includes(value);
}

export function validateRegistration(input: unknown): {
  ok: true;
  data: RegistrationPayload;
} | {
  ok: false;
  errors: FieldErrors;
} {
  const source = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const fullName = sanitizeLine(source.fullName, LIMITS.fullName);
  const institutionalEmail = sanitizeLine(source.institutionalEmail, LIMITS.institutionalEmail).toLowerCase();
  const department = sanitizeLine(source.department, LIMITS.department);
  const yearOfStudy = sanitizeLine(source.yearOfStudy, 8);
  const skills = sanitizeMultiline(source.skills, LIMITS.skills);
  const motivation = sanitizeMultiline(source.motivation, LIMITS.motivation);
  const interestType = source.interestType;
  const rawInterests = Array.isArray(source.technicalInterests) ? source.technicalInterests : [];

  const technicalInterests = rawInterests
    .filter((item): item is string => typeof item === "string")
    .map((item) => sanitizeLine(item, 40))
    .filter((item) => (TECHNICAL_INTERESTS as readonly string[]).includes(item))
    .slice(0, LIMITS.technicalInterests);

  if (fullName.length < 2) errors.fullName = "Enter your full name.";
  if (!EMAIL_PATTERN.test(institutionalEmail)) {
    errors.institutionalEmail = "Enter a valid institutional email address.";
  }
  if (!department || !(DEPARTMENTS as readonly string[]).includes(department)) {
    errors.department = "Select your department.";
  }
  if (!isYear(yearOfStudy)) errors.yearOfStudy = "Select your year of study.";
  if (technicalInterests.length === 0) {
    errors.technicalInterests = "Select at least one technical interest.";
  }
  if (!isInterestType(interestType)) {
    errors.interestType = "Choose membership, event participation, or both.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const data: RegistrationPayload = {
    fullName,
    institutionalEmail,
    department,
    yearOfStudy,
    technicalInterests,
    interestType,
  };

  if (skills) data.skills = skills;
  if (motivation) data.motivation = motivation;

  return { ok: true, data };
}

export function interestTypeLabel(type: InterestType): string {
  if (type === "membership") return "Club membership";
  if (type === "events") return "Event participation";
  return "Club membership and event participation";
}
