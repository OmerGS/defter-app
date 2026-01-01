export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    // True = Operational error (e.g. "Invalid Password", "User not found")
    // False = Programming bug (e.g. "undefined is not a function")
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}