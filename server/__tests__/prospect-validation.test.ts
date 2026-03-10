import { validateProspect, validateContact } from "../prospect-helpers";

describe("prospect creation validation", () => {
  test("rejects a blank company name", () => {
    const result = validateProspect({
      companyName: "",
      roleTitle: "Software Engineer",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Company name is required");
  });

  test("rejects a blank role title", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Role title is required");
  });
});

describe("salary field validation", () => {
  test("accepts a valid salary", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      salary: 120000,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts null salary (optional)", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      salary: null,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts undefined salary (not provided)", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts zero salary", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      salary: 0,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("rejects negative salary", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      salary: -50000,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Salary cannot be negative");
  });

  test("rejects non-integer salary", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      salary: 120000.50,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Salary must be a whole number");
  });

  test("rejects salary that is too large", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      salary: 100_000_000,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Salary is too large");
  });

  test("rejects non-numeric salary string", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      salary: "abc",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Salary must be a whole number");
  });
});

describe("contact validation", () => {
  test("accepts a valid contact with all fields", () => {
    const result = validateContact({
      name: "Jane Doe",
      contactType: "Recruiter",
      email: "jane@example.com",
      title: "Senior Recruiter",
      notes: "Met at conference",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts a contact with only required fields", () => {
    const result = validateContact({
      name: "John Smith",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("rejects a blank contact name", () => {
    const result = validateContact({
      name: "",
      contactType: "Recruiter",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Contact name is required");
  });

  test("rejects a missing contact name", () => {
    const result = validateContact({
      contactType: "Recruiter",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Contact name is required");
  });

  test("rejects an invalid contact type", () => {
    const result = validateContact({
      name: "Jane Doe",
      contactType: "Manager",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Contact type must be one of: Recruiter, Current Employee, Other");
  });

  test("accepts all valid contact types", () => {
    for (const type of ["Recruiter", "Current Employee", "Other"]) {
      const result = validateContact({
        name: "Jane Doe",
        contactType: type,
      });
      expect(result.valid).toBe(true);
    }
  });

  test("rejects an invalid email", () => {
    const result = validateContact({
      name: "Jane Doe",
      email: "not-an-email",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Invalid email address");
  });

  test("accepts a valid email", () => {
    const result = validateContact({
      name: "Jane Doe",
      email: "jane@company.com",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts empty email (optional field)", () => {
    const result = validateContact({
      name: "Jane Doe",
      email: "",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts null email (optional field)", () => {
    const result = validateContact({
      name: "Jane Doe",
      email: null,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
