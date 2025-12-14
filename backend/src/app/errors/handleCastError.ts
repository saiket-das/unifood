import { Error } from "mongoose";
import httpStatus from "http-status";
import {
  ErrorSourcesProps,
  GenericErrorResponseProps,
} from "../interfaces/error.interface";

const handleCastError = (error: Error.CastError): GenericErrorResponseProps => {
  const statusCode = httpStatus.BAD_REQUEST;
  const errorSources: ErrorSourcesProps = [
    {
      path: error?.path,
      message: error?.message,
    },
  ];
  return {
    statusCode,
    message: "Invalid ID",
    errorSources,
  };
};

export default handleCastError;
