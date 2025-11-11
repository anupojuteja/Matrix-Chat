export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function errorMiddleware(err, req, res, next) {
  console.error(err);
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  return res.status(500).json({ error: "Internal Server Error" });
}
