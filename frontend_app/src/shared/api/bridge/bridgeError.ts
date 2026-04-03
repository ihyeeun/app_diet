export class BridgeHandledError extends Error {
  statusCode: number;
  errorCode: string;

  constructor(message: string, statusCode: number, errorCode: string) {
    super(message);
    this.name = "BridgeHandledError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

export function isBridgeHandledError(error: unknown): error is BridgeHandledError {
  return error instanceof BridgeHandledError;
}
