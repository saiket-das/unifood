import { ZodError } from "zod";
import httpStatus from "http-status";
import {
  ErrorSourcesProps,
  GenericErrorResponseProps,
} from "../interfaces/error.interface";

const handleZodError = (err: ZodError): GenericErrorResponseProps => {
  const statusCode = httpStatus.BAD_REQUEST;
  const errorSources: ErrorSourcesProps = err.issues.map((issue) => {
    return {
      path: issue?.path[issue.path.length - 1],
      message: issue?.message,
    };
  });

  return {
    statusCode,
    message: "Validation error",
    errorSources,
  };
};
export default handleZodError;
