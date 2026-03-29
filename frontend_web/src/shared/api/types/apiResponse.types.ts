export type ApiSuccessResponse<T> = {
  message: string;
  statusCode: number;
  data: T;
};

export type ApiFailResponse = {
  message: string;
  statusCode: number;
  error: string;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiFailResponse;

export function isApiSuccess<T>(res: ApiResponse<T>): res is ApiSuccessResponse<T> {
  return "data" in res;
}
