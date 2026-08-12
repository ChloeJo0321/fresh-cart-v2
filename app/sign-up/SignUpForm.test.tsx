import { render, screen } from "@testing-library/react";
import SignInForm from "../sign-in/SignInForm";
import userEvent from "@testing-library/user-event";

const mockPush = jest.fn();

// Mock for External dependencies
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),

  useSearchParams: () => ({
    get: jest.fn(() => null),
  }),
}));

test("It renders two input fields and a button", () => {
  // Render the component
  render(<SignInForm />);

  // Find elements
  const emailInput = screen.getByRole("textbox");
  const passwordInput = screen.getByLabelText(/password:/i);
  const button = screen.getByRole("button");

  // Assertion
  expect(emailInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
  expect(button).toBeInTheDocument();
});

test("It shows an appropriate error message when invalid email is provided", async () => {
  // Create user instance
  const user = userEvent.setup();

  // Render sign in form
  render(<SignInForm />);

  // Find the email element
  const emailInput = screen.getByRole("textbox");

  // User enters email
  await user.type(emailInput, "abc");

  const errorMessage = screen.getByText("Please enter a valid email address");
  // Assertion
  expect(errorMessage).toBeInTheDocument();
});

test("It shows an appropriate error message when invalid password is provided", async () => {
  const user = userEvent.setup();

  render(<SignInForm />);

  const passwordInput = screen.getByLabelText(/password:/i);

  await user.type(passwordInput, "a$");

  const errorMessage = screen.getByText(
    "Password should be at least 10 characters",
  );

  expect(errorMessage).toBeInTheDocument();
});

test("the fetch function is never called when invalid email is provided", async () => {
  // Arrange
  // Create user instance
  const user = userEvent.setup();

  // Create a mock function for fetch
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  // Render Sign In component
  render(<SignInForm />);

  // Find elements (email, password, button)
  const emailInput = screen.getByRole("textbox");
  const passwordInput = screen.getByLabelText(/password:/i);
  const submitButton = screen.getByRole("button");

  // Act
  // User types invalid email, valid password
  await user.type(emailInput, "abc");
  await user.type(passwordInput, "abcde12345%");
  // User clicks submit button
  await user.click(submitButton);

  // Assert
  // Check if mock function is "not" called
  expect(mockFetch).not.toHaveBeenCalled();
});

test("the fetch function is called when valid credentials are provided", async () => {
  // Arrange
  const user = userEvent.setup();

  // Create mock function for fetch
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  const res = {
    ok: true,
    json: jest.fn().mockResolvedValue({}),
  };

  mockFetch.mockResolvedValue(res);

  // Render component
  render(<SignInForm />);

  // Find element(email, password)
  const emailInput = screen.getByRole("textbox");
  const passwordInput = screen.getByLabelText(/password:/i);
  const submitButton = screen.getByRole("button");

  // Act

  await user.type(emailInput, "abc@test.com");
  await user.type(passwordInput, "abcde12345%");
  await user.click(submitButton);

  // Assert
  expect(mockFetch).toHaveBeenCalledWith("/api/sign-in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "abc@test.com",
      password: "abcde12345%",
    }),
  });
});

test("Error message appears when the user fails to sign in", async () => {
  const user = userEvent.setup();

  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  const res = {
    ok: false,
    json: jest.fn().mockResolvedValue({ message: "Invalid email or password" }),
  };

  mockFetch.mockResolvedValue(res);

  render(<SignInForm />);

  const emailInput = screen.getByRole("textbox");
  const passwordInput = screen.getByLabelText(/password:/i);
  const submitButton = screen.getByRole("button");

  await user.type(emailInput, "abc@test.com");
  await user.type(passwordInput, "abcde12345%");
  await user.click(submitButton);

  const errorMessage = await screen.findByText("Invalid email or password");
  expect(errorMessage).toBeInTheDocument();
});

test("Redirects to the main page when sign-in succeeds", async () => {
  const user = userEvent.setup();

  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  const res = {
    ok: true,
    json: jest.fn().mockResolvedValue({}),
  };

  mockFetch.mockResolvedValue(res);

  render(<SignInForm />);

  const emailInput = screen.getByRole("textbox");
  const passwordInput = screen.getByLabelText(/password:/i);
  const submitButton = screen.getByRole("button");

  await user.type(emailInput, "abc@test.com");
  await user.type(passwordInput, "abcde12345%");
  await user.click(submitButton);

  // Assert => router.push(safeRedirect)
  expect(mockPush).toHaveBeenCalledWith("/");
});

test("Error message is displayed when merging guest cart fails", async () => {
  const user = userEvent.setup();

  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  // Call sign in API
  const signInRes = {
    ok: true,
    json: jest.fn().mockResolvedValue({}),
  };

  mockFetch.mockResolvedValueOnce(signInRes);

  // Call merge API
  const mergeRes = { ok: false };
  mockFetch.mockResolvedValueOnce(mergeRes);

  localStorage.setItem("cart", JSON.stringify([{ productId: 1, quantity: 2 }]));

  render(<SignInForm />);

  const emailInput = screen.getByRole("textbox");
  const passwordInput = screen.getByLabelText(/password:/i);
  const submitButton = screen.getByRole("button");

  await user.type(emailInput, "abc@test.com");
  await user.type(passwordInput, "abcde12345%");
  await user.click(submitButton);

  const errorMessage = await screen.findByText(
    "Failed to merge guest cart with your account.",
  );
  expect(errorMessage).toBeInTheDocument();
});

test("Merge API is called and guest cart is cleared when guest cart exists", async () => {
  const user = userEvent.setup();

  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  // Simulate sign in API
  const signInRes = { ok: true, json: jest.fn().mockResolvedValue({}) };
  mockFetch.mockResolvedValueOnce(signInRes);

  // Simulate merge API
  const mergeRes = { ok: true };
  mockFetch.mockResolvedValueOnce(mergeRes);

  localStorage.setItem("cart", JSON.stringify([{ productId: 1, quantity: 2 }]));

  render(<SignInForm />);

  const emailInput = screen.getByRole("textbox");
  const passwordInput = screen.getByLabelText(/password:/i);
  const submitButton = screen.getByRole("button");

  // Simulate sign in
  await user.type(emailInput, "abc@test.com");
  await user.type(passwordInput, "abcde12345%");
  await user.click(submitButton);

  // Check merge API
  expect(mockFetch).toHaveBeenCalledWith("/api/cart/merge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      guestCart: [{ productId: 1, quantity: 2 }],
    }),
  });
  // Check if guest cart is cleared
  expect(localStorage.getItem("cart")).toBeNull();
});
