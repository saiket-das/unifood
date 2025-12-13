export type ErrorSourcesProps = {
  path: string | number;
  message: string;
}[];

export type GenericErrorResponseProps = {
  statusCode: number;
  message: string;
  errorSources: ErrorSourcesProps;
};
