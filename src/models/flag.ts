import {Command} from './command';
import {debug, error, styledString, TextColor} from './logger';

export class Flag<T> {
  name: string;
  private readonly required: boolean;
  private readonly shortForm: string;
  private readonly longForm: string;
  value: T | undefined;
  /**
   * @typedef {Object} ParserReturn
   * @property {ValueParseError|undefined} error parsing error
   * @property {T|undefined} result parsed result
   */
  /**
   * @callback Parser
   * @param {string} value the value that will be parsed
   * @returns {ParserReturn}
   */
  private readonly parser: (
    value: string
  ) => {error?: ValueParseError; result: T | undefined};
  private readonly usage: string;
  private parent: Command | undefined;
  /**
   * Creates a new object Flag
   * @param options - Options to create a new flag
   */
  public constructor(options: {
    name: string;
    required: boolean;
    shortForm: string;
    parser: (value: string) => {error?: ValueParseError; result: T | undefined};
    usage: string;
  });
  /**
   * Creates a new object Flag
   * @param options - Options to create a new flag
   */
  public constructor(options: {
    name: string;
    required: boolean;
    longForm: string;
    parser: (value: string) => {error?: ValueParseError; result: T | undefined};
    usage: string;
  });
  /**
   * Creates a new object Flag
   * @param options - Options to create a new flag
   */
  public constructor(options: {
    name: string;
    required: boolean;
    longForm: string;
    parser: (value: string) => {error?: ValueParseError; result: T};
    usage: string;
  });
  /**
   * Creates a new object Flag
   * @param options - Options to create a new flag
   */
  public constructor(options: {
    name: string;
    required: boolean;
    shortForm: string;
    longForm: string;
    parser: (value: string) => {error?: ValueParseError; result: T};
    usage: string;
  });
  /**
   * Creates a new object Flag
   * @param options - Options to create a new flag
   */
  public constructor(options: {
    name: string;
    defaultValue: T;
    required: boolean;
    shortForm: string;
    parser: (value: string) => {error?: ValueParseError; result: T};
    usage: string;
  });
  /**
   * Creates a new object Flag
   * @param options - Options to create a new flag
   */
  public constructor(options: {
    name: string;
    defaultValue: T;
    required: boolean;
    longForm: string;
    parser: (value: string) => {error?: ValueParseError; result: T};
    usage: string;
  });
  /**
   * Creates a new object Flag
   * @param options - Options to create a new flag
   */
  public constructor(options: {
    name: string;
    defaultValue: T;
    required: boolean;
    shortForm: string;
    longForm: string;
    parser: (value: string) => {error?: ValueParseError; result: T};
    usage: string;
  });
  /**
   * Creates a new object Flag
   * @param options - Options to create a new flag
   */
  public constructor(options: {
    name: string;
    defaultValue: T;
    required: boolean;
    shortForm: string;
    longForm: string;
    parser: (value: string) => {error?: ValueParseError; result: T};
    usage: string;
  }) {
    this.name = options.name;
    if (options.defaultValue !== undefined && options.defaultValue !== null) {
      this.value = options.defaultValue;
    }
    this.required = options.required;
    this.shortForm = options.shortForm;
    this.longForm = options.longForm;
    this.parser = options.parser;
    this.usage = options.usage;
  }

  /**
   * Check if flag is required
   * @returns - True if the flag is required, false if not
   */
  get isRequired(): boolean {
    return this.required;
  }

  /**
   * Adds a new command
   * @param c - New command to add
   */
  set newParent(c: Command) {
    if (this.parent === undefined) {
      this.parent = c;
      return;
    }
    error('Cannot assign change parent of flag');
  }

  /**
   * Updates the value of the current flag
   * @param value - Current value to add
   * @returns - ValueParseError if there's a parsing, undefined if not
   */
  updateValue(value: string): ValueParseError | undefined {
    debug(`Update value function called with ${value}`);
    const p: {error?: ValueParseError; result: T | undefined} = this.parser(
      value
    );
    if (p.error === undefined && p.result !== undefined) {
      debug('Result is ' + p.result);
      this.value = p.result;
    }
    return p.error;
  }
  /**
   * Get the long form of the current flag
   * @returns - The long form of the flag if exists, returns undefined if there's no long form for the given flag
   */
  get getLongForm(): string | undefined {
    return this.longForm === undefined ? undefined : `--${this.longForm}`;
  }

  /**
   * Get the shortform of the flag
   * @returns - The short form of the flag if exists, returns undefined if the short command for the current flag
   */
  get getShortForm(): string | undefined {
    return this.shortForm === undefined ? undefined : `-${this.shortForm}`;
  }

  /**
   * Get the textual description of the flag
   * @returns - The textual representation for the current flag
   */
  public toString(): string {
    const p = [this.getShortForm, this.getLongForm, this.name]
      .filter(e => e !== undefined && e !== null)
      .join('\t');
    return `${p}\t${styledString(
      'Usage:',
      TextColor.brightCyan,
      undefined,
      true
    )} ${this.usage}\t${this.required ? '(required)' : '(optional)'}`;
  }
  /**
   * Checks if the current flag equals with other object
   * @param o - The other object to compare
   * @returns - Returns true if the current flag equals to the given object
   */
  public equals(o: object): boolean {
    if (o instanceof Flag) {
      if (
        (this.shortForm === undefined || this.shortForm === null) &&
        (o.shortForm === undefined || o.shortForm === null) &&
        (this.longForm === undefined || this.longForm === null) &&
        (o.longForm === undefined || o.longForm === null)
      ) {
        return false;
      }
      return (
        (this.shortForm !== undefined && o.shortForm !== undefined
          ? this.shortForm === o.shortForm
          : false) ||
        (this.longForm !== undefined && o.longForm !== undefined
          ? this.longForm === o.longForm
          : false)
      );
    }
    return false;
  }
}
