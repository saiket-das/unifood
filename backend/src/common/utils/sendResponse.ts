import { Response } from 'express';
import { ResponseProps } from '../interfaces/response.interface';

export const sendResponse = <T>(res: Response, data: ResponseProps<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    meta: data?.meta,
    data: data.data,
  });
};
