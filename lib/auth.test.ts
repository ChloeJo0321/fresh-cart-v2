import { validateSignInInput } from "./auth";

// Unit test

// Invalid email
test("Returns false when invalid email is provided", () => {
  // Arrange
  const email = "abc";
  const password = "abcde12345%";

  // Act
  const isValid = validateSignInInput(email, password);

  // Assert
  expect(isValid).toBeFalsy();
});

// Invalid password
test("Returns false when password is not a string", () => {
  const email = "abc@test.com";
  const password = 3;

  const isValid = validateSignInInput(email, password);

  expect(isValid).toBeFalsy();
});

// Empty input
test("Returns false when password is an empty string", () => {
  const email = "abc@test.com";
  const password = "";

  const isValid = validateSignInInput(email, password);

  expect(isValid).toBeFalsy();
});

// Valid email + valid password
test("Returns true when email and password are valid", () => {
  const email = "abc@test.com";
  const password = "abcde12345%";

  const isValid = validateSignInInput(email, password);

  expect(isValid).toBeTruthy();
});
