const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const PASSWORD_REQUIREMENTS = 'Use at least 8 characters with letters and numbers';

export const isPasswordStrong = (password = '') => PASSWORD_REGEX.test(password);
