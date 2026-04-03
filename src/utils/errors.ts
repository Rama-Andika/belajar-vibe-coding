export class UnauthorizedError extends Error {
  constructor(message: string = "unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
