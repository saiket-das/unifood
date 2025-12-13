import { NextFunction, Response } from "express";

type MetaProps = {
  limit: number;
  page: number;
  total: number;
  totalPage: number;
};

interface ResponseProps<T> {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: MetaProps;
  data: T;
}

const sendResponse = <T>(res: Response, data: ResponseProps<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    meta: data?.meta,
    data: data.data,
  });
};

export default sendResponse;
