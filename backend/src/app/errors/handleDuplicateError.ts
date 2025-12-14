import httpStatus from "http-status";
import {
  ErrorSourcesProps,
  GenericErrorResponseProps,
} from "../interfaces/error.interface";

const handleDuplicateError = (error: any): GenericErrorResponseProps => {
  const statusCode = httpStatus.BAD_REQUEST;
  const fieldName = Object.keys(error?.keyValue)[0];
  const fieldValue = error?.keyValue[fieldName];
  const errorMessage = `${fieldValue} already exists!`;

  const errorSources: ErrorSourcesProps = [
    {
      path: Object.keys(error?.errorResponse?.keyPattern)[0],
      message: errorMessage,
      // message: `${extractedMessage} already exists!`,
    },
  ];
  return {
    statusCode,
    message: "Duplicate key error",
    errorSources,
  };
};

export default handleDuplicateError;
