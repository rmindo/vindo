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
    setQuery(data: object): string;
  }

  /**
   * File
   * @public
   */
  export interface FileInterface {
    ext(name: string): string;
    get(...args: string | string[]): object;
    html(...args: string | string[] | object): string;
    read(...args: string | string[]): string;
    stats(...args: string | string[]): object;
    isDir(...args: string | string[]): boolean;
    join(...args: string | string[]): string;
    parse(...args: string | string[]): object;
    exists(...args: string | string[]): boolean;
    readdir(...args: string | string[]): string;
    readAsync(...args: string | string[]): Promise<Buffer>;
  }


  /**
   * Object
   * @public
   */
  export interface ObjectInterface extends Object {
    define(object: object, key: string, descriptor: object): void;
    set(object: object, key: string, descriptor: object): void;
    get(object: object, key: string): object;
    map(object: object, cb: Function): object;
    has(array: string[] | string, object: object): boolean;
    count(obj: object): number;
    merge(one: object, two: object, excl?: string[]): object;
    filter(object: object, exclude: string[]): object;
  }

  /**
   * String
   * @public
   */
  export interface StringInterface {
    padEnd(str, pad): string;
    padStart(str, pad): string;    
    replace(string: string, data: object): string;
    toUCFirst(string: string): string;
    toKebabCase(string: string): string;
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