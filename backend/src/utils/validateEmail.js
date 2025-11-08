export const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._-]+@kmail.com$/;
  return regex.test(email);
};
