export type MetaProps = {
  limit: number;
  page: number;
  total: number;
  totalPage: number;
};

export interface ResponseProps<T> {
  success: boolean;
  statusCode: number;
  message: string;
  meta?: MetaProps;
  data: T;
}
