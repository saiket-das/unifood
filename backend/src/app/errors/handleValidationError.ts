import { Error } from "mongoose";
import httpStatus from "http-status";
import {
  ErrorSourcesProps,
  GenericErrorResponseProps,
} from "../interfaces/error.interface";

const handleValidationError = (
  err: Error.ValidationError
): GenericErrorResponseProps => {
  const statusCode = httpStatus.BAD_REQUEST;
  const errorSources: ErrorSourcesProps = Object.values(err.errors).map(
    (value: Error.ValidatorError | Error.CastError) => {
      return {
        path: value?.path,
        message: value.message,
      };
    }
  );

  return {
    statusCode,
    message: "Validation error",
    errorSources,
  };
};

export default handleValidationError;
