interface IApiError {
  status?: boolean;
  code?: number;
  type?: string;
  message?: string;
  name?: string;
}

class ApiError extends Error {
  status: boolean;
  code: number;
  type: string;

  constructor({
    status, code, type, message, name,
  }: IApiError) {
    super(message || 'Server was crash, we does not know cause');
    this.status = status || false;
    this.code = code || 500;
    this.type = type || 'Unnamed';
    this.name = name || 'ServerError';
  }

  static serverError({
    status, code, message, type,
  }: IApiError) {
    return new ApiError({
      status,
      code,
      type,
      message,
    });
  }

  static loginError({
    status, code, message, type,
  }: IApiError) {
    return new ApiError({
      status,
      code: code || 401,
      type,
      message,
      name: 'LoginError',
    });
  }

  static corsError({
    status, code, message, type,
  }: IApiError) {
    return new ApiError({
      status,
      code: code || 400,
      type,
      message,
      name: 'CorsError',
    });
  }

  static activationError({
    status, code, message, type,
  }: IApiError) {
    return new ApiError({
      status,
      code,
      type,
      message,
      name: 'ActivationError',
    });
  }

  static databaseError({
    status, code, message, type,
  }: IApiError) {
    return new ApiError({
      status,
      code,
      type,
      message,
      name: 'DatabaseError',
    });
  }
}

export default ApiError;
