import { Request, Response, NextFunction } from 'express';


export interface AppError extends Error { statusCode?: number }


export const createError = (message: string, statusCode: number = 500): AppError => {
const err = new Error(message) as AppError;
err.statusCode = statusCode;
return err;
};


export const errorHandler = (error: AppError, req: Request, res: Response, next: NextFunction) => {
const statusCode = error.statusCode || 500;
const message = statusCode === 500 && process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message;
console.error('Error:', { message: error.message, stack: error.stack, url: req.url });
res.status(statusCode).json({ error: { message, statusCode, timestamp: new Date().toISOString(), ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }) } });
};
