export class ApiError extends Error {
  constructor(public status: number, public body: string) {
    super(`API error ${status}`);
  }
}

export class ParseError extends Error {
  constructor(public cause: unknown) {
    super('Failed to parse API response');
  }
}
