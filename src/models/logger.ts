import {VERBOSE} from '../config';
import {Command} from './command';

export enum TextColor {
  black = 30,
  red = 31,
  green = 32,
  yellow = 33,
  blue = 34,
  magenta = 35,
  cyan = 36,
  white = 37,
  grey = 90,
  brightRed = 91,
  brightGreen = 92,
  brightYellow = 93,
  brightBlue = 94,
  brightMagenta = 95,
  brightCyan = 96,
  brightWhite = 97,
}

export enum BackgroundColor {
  black = 40,
  red = 41,
  green = 42,
  yellow = 43,
  blue = 44,
  magenta = 45,
  cyan = 46,
  white = 47,
  grey = 100,
  brightRed = 101,
  brightGreen = 102,
  brightYellow = 103,
  brightBlue = 104,
  brightMagenta = 105,
  brightCyan = 106,
  brightWhite = 107,
}

/**
 * Applies styling for a given text
 * @param text - The non-styled string
 * @param fg - The foreground color
 * @param bg - The background color
 * @param bold - Indicates that if the text is bold
 * @returns - styled form of the given string
 */
export function styledString(
  text: string,
  fg?: TextColor,
  bg?: BackgroundColor,
  bold = false
): string {
  let fgString = '';
  let bgString = '';
  let boldString = '';
  if (fg !== undefined) {
    fgString = `\x1b[${fg}m`;
  }
  if (bg !== undefined) {
    bgString = `\x1b[${bg}m`;
  }
  if (bold) {
    boldString = '\x1b[1m';
  }
  return `${bgString}${fgString}${boldString}${text}\x1b[0m`;
}

/**
 * Shows an error message on stderr
 * @param message - The message that will be sent
 */
export function error(message: string): void {
  console.error(
    `${styledString('ERROR:', TextColor.red, undefined, true)} ${message}`
  );
}

/**
 * Shows an info message on stdout
 * @param message - The message that will be shown
 */
export function info(message: string): void {
  console.info(
    `${styledString('INFO:', TextColor.yellow, undefined, true)} ${message}`
  );
}

/**
 * Shows a success message on stdout
 * @param message - The message that will be shown
 */
export function success(message: string): void {
  console.log(
    `${styledString('SUCCESS:', TextColor.green, undefined, true)} ${message}`
  );
}

/**
 * Function shows a debug message on stdout
 * @param {string} message The message that will be shown
 */
export function debug(message: string): void {
  if (VERBOSE) {
    console.debug(
      `${styledString('DEBUG', TextColor.grey, undefined, true)} ${message}`
    );
  }
}

/**
 * Shows a help page for given command execution stack
 * @param commandExecutionStack - The execution stack of the command
 */
export function help(commandExecutionStack: Command[]) {
  const s = commandExecutionStack.map(e => e.getName).join(' ');
  const lc = commandExecutionStack[commandExecutionStack.length - 1];
  let usageText = `${s}`;
  const lcf = lc.getFlags;
  if (lcf.length > 0) {
    usageText += ' [OPTIONS]';
  }
  const lcsc = lc.getSubcommands;
  if (lcsc.length > 0) {
    usageText += ' COMMAND';
  }
  console.info(
    `${styledString('Usage:', TextColor.blue, undefined, true)} ${usageText}`
  );
  console.info(lc.getLongDescription ?? lc.getDescription);
  if (lcf.length > 0) {
    console.info('Options:');
    for (const f of lcf) {
      console.info(f.toString());
    }
  }
  if (lcsc.length > 0) {
    console.info('Commands:');
    for (const c of lcsc) {
      console.info(`${c.getName}\t${c.getDescription}`);
    }
  }
}
