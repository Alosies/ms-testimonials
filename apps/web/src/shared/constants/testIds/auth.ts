export const authTestIds = {
  // Login page
  loginForm: 'auth-login-form',
  loginEmailInput: 'auth-login-email-input',
  loginPasswordInput: 'auth-login-password-input',
  loginSubmitButton: 'auth-login-submit-button',
  loginErrorMessage: 'auth-login-error-message',

  // Signup page
  signupForm: 'auth-signup-form',
  signupEmailInput: 'auth-signup-email-input',
  signupPasswordInput: 'auth-signup-password-input',
  signupSubmitButton: 'auth-signup-submit-button',
} as const;

export type AuthTestId = typeof authTestIds;
