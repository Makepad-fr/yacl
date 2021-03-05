// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ValueParseError extends Error {
  /**
   * Function constructs a newValueParseError
   * @constructor
   * @param {string} message The error message
   */
  constructor(message: string) {
    super(message);
    this.name = 'ValueParseError';
  }
}
