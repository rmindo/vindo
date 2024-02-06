export namespace Utility {

  type ParsedURL = {
    url: string;
    query: {
      [key: string]: string;
    };
  }

  /**
   * URL
   * @public
   */
  export interface URLInterface {
    split(url: string): string[];
    parse(url: string): ParsedURL;
  }

  /**
   * File
   * @public
   */
  export interface FileInterface {
    ext(name: string): string;
    get(args: string | string[]): object;
    html(args: string | string[], data?: object): string;
    read(args: string | string[]): string;
    stats(args: string | string[]): object;
    isDir(args: string | string[]): boolean;
    join(args: string | string[]): string;
    parse(args: string | string[]): object;
    exists(args: string | string[]): boolean;
    readdir(args: string | string[]): string;
    readAsync(args: string | string[]): Promise<Buffer>;
  }


  /**
   * Object
   * @public
   */
  export interface ObjectInterface extends Object {
    define(object: object, key: string, descriptor: object): void;
    get(object: object, key: string): object;
    map(object: object, cb: Function): object;
    has(array: string[] | string, object: object): boolean;
    merge(one: object, two: object): void;
    filter(object: object, exclude: string[], data?: object): object;
  }

  /**
   * String
   * @public
   */
  export interface StringInterface {
    replace(string: string, data: object): string;
    toUCFirst(string: string): string;
    toCamelCase(string: string, separator: string): string;
  }

  /**
   * Events
   * @public
   */
  export interface EventsInterface {
    on(name: string, cb: Function): void;
    has(name: string): void;
    emit(name: string, ...args: any): void;
    remove(name: string): void;
  }


  /**
   * Interfaces
   */
  export const url: URLInterface;
  export const file: FileInterface;
  export const object: ObjectInterface;
  export const string: StringInterface;
  export const events: EventsInterface;
}