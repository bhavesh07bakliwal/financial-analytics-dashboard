declare module 'json2csv' {
  export interface ParserFieldConfig {
    label?: string;
    value: string;
  }

  export interface ParserOptions {
    fields?: (string | ParserFieldConfig)[];
    header?: boolean;
    delimiter?: string;
    quote?: string;
  }

  export class Parser {
    constructor(options?: ParserOptions);
    parse(data: unknown): string;
  }
}
