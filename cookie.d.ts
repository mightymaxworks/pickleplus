/**
 * Declaration file for cookie module
 */
declare module 'cookie' {
  export interface CookieParseOptions {
    decode?: (value: string) => string;
  }

  export interface CookieSerializeOptions {
    domain?: string;
    encode?: (value: string) => string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: true | false | 'lax' | 'strict' | 'none';
    secure?: boolean;
  }

  /**
   * Parse cookie header string and return an object of all cookie name-value pairs
   */
  export function parse(str: string, options?: CookieParseOptions): { [key: string]: string };

  /**
   * Serialize a cookie name-value pair into a string suitable for use in an HTTP header
   */
  export function serialize(name: string, val: string, options?: CookieSerializeOptions): string;
}