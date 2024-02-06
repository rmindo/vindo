export namespace Exception {

  export type StatusType = {
    [key: number]: {
      code: number;
      name?: string;
      message: string;
    }
  }
  export type OptionArgs = {
    log?: boolean;
    code?: number;
    name?: string;
    data?: {
      [key: string]: string
    },
    message?: string | null
  }

  /**
   * Exception classes
   */
  export class NotFoundException extends Error {
    constructor(option?: OptionArgs | string, log?: boolean);
  }
  export class BadRequestException extends Error {
    constructor(option?: OptionArgs | string, log?: boolean);
  }
  export class ForbiddenException extends Error {
    constructor(option?: OptionArgs | string, log?: boolean);
  }
  export class UnauthorizedException extends Error {
    constructor(option?: OptionArgs | string, log?: boolean);
  }
  export class MethodNotAllowedException extends Error {
    constructor(option?: OptionArgs | string, log?: boolean);
  }
  export class InternalServerErrorException extends Error {
    constructor(option?: OptionArgs | string, log?: boolean);
  }


  /**
   * Statuses
   */
  export const statuses: StatusType;
  
  /**
   * Methods
   */
  export function error(error: Error): object;
  export function isErrorClass(error: Error): boolean;
  export function createErrorSubClass(error: Error): void;
}