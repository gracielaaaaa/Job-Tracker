import { STATUSES, INTEREST_LEVELS, CONTACT_TYPES } from "@shared/schema";

export function getNextStatus(currentStatus: string): string {
  const terminalStatuses = ["Offer", "Rejected", "Withdrawn"];
  if (terminalStatuses.includes(currentStatus)) {
    return currentStatus;
  }
  const index = STATUSES.indexOf(currentStatus as (typeof STATUSES)[number]);
  if (index === -1 || index >= STATUSES.length - 1) {
    return currentStatus;
  }
  const next = STATUSES[index + 1];
  if (next === "Rejected" || next === "Withdrawn") {
    return currentStatus;
  }
  return next;
}

export function validateProspect(data: Record<string, unknown>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.companyName || typeof data.companyName !== "string" || data.companyName.trim() === "") {
    errors.push("Company name is required");
  }

  if (!data.roleTitle || typeof data.roleTitle !== "string" || data.roleTitle.trim() === "") {
    errors.push("Role title is required");
  }

  if (data.status !== undefined) {
    if (!STATUSES.includes(data.status as (typeof STATUSES)[number])) {
      errors.push(`Status must be one of: ${STATUSES.join(", ")}`);
    }
  }

  if (data.interestLevel !== undefined) {
    if (!INTEREST_LEVELS.includes(data.interestLevel as (typeof INTEREST_LEVELS)[number])) {
      errors.push(`Interest level must be one of: ${INTEREST_LEVELS.join(", ")}`);
    }
  }

  if (data.salary !== undefined && data.salary !== null) {
    const salary = Number(data.salary);
    if (isNaN(salary) || !Number.isInteger(salary)) {
      errors.push("Salary must be a whole number");
    } else if (salary < 0) {
      errors.push("Salary cannot be negative");
    } else if (salary > 99_999_999) {
      errors.push("Salary is too large");
    }
  }

  return { valid: errors.length === 0, errors };
}

export function isTerminalStatus(status: string): boolean {
  return status === "Rejected" || status === "Withdrawn" || status === "Offer";
}

export function validateContact(data: Record<string, unknown>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
    errors.push("Contact name is required");
  }

  if (data.contactType !== undefined) {
    if (!CONTACT_TYPES.includes(data.contactType as (typeof CONTACT_TYPES)[number])) {
      errors.push(`Contact type must be one of: ${CONTACT_TYPES.join(", ")}`);
    }
  }

  if (data.email !== undefined && data.email !== null && data.email !== "") {
    const emailStr = String(data.email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailStr)) {
      errors.push("Invalid email address");
    }
  }

  return { valid: errors.length === 0, errors };
}
