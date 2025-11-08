export const errorHandler = (err, req, res, next) => {
  console.error(err);
  const code = err.status || 500;
  const message = err.message || 'Something went wrong.';
  res.status(code).json({ error: { code, message } });
};
