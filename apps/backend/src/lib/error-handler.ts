export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler = (
  err: any,
  _req: any,
  res: any,
  _next: any,
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : "Internal server error";

  res.status(statusCode).json({
    error: message,
    code: err instanceof AppError ? err.code : undefined,
  });
};
