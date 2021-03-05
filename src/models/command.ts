import * as path from 'path';
import {debug, error, help} from './logger';
import {Flag} from './flag';
import {BooleanFlag} from './booleanFlag';
const exit = process.exit;
export class Command {
  private readonly name: string;

  private readonly description: string;

  private readonly longDescription: string | undefined;

  private readonly subcommands: Command[];

  private readonly flags: Flag<any>[];

  private readonly runner: (
    args: string[],
    flags: Flag<any>[],
    more: string[]
  ) => void;

  private readonly preRun:
    | ((args: string[], flags: Flag<any>[], more: string[]) => void)
    | undefined;

  private readonly postRun:
    | ((args: string[], flags: Flag<any>[], more: string[]) => void)
    | undefined;

  private parent: Command | undefined;

  /**
   * Build a new Command object
   * @param args - Arguments used to create a new Command object
   */
  constructor(args: {
    name: string;
    description: string;
    run: (args: string[], flags: Flag<any>[], more: string[]) => void;
    preRun?: (args: string[], flags: Flag<any>[], more: string[]) => void;
    postRun?: (args: string[], flags: Flag<any>[], more: string[]) => void;
    longDescription?: string;
  }) {
    this.name = args.name;
    this.description = args.description;
    this.subcommands = [];
    this.flags = [];
    this.runner = args.run;
    this.parent = undefined;
    this.preRun = args.preRun;
    this.postRun = args.postRun;
    this.longDescription = args.longDescription;
  }
  /**
   * Get the name
   * @returns - The name of the command
   */
  get getName(): string {
    return this.name;
  }

  /**
   * Get the description of the current command
   * @returns - The description of the command
   */
  get getDescription(): string {
    return this.description;
  }

  /**
   * Get the list of subcommands
   * @returns - The array of subcommands of the current command
   */
  get getSubcommands(): Command[] {
    return this.subcommands;
  }

  /**
   * Get the list of flags
   * @returns - The array of the Flags
   */
  get getFlags(): Flag<any>[] {
    return this.flags;
  }

  /**
   * Changes the parent of the command with given command if the parent command is undefined
   * @param c - The new parent command
   */
  set newParent(c: Command) {
    if (this.parent === undefined) {
      this.parent = c;
      return;
    }
    debug(`There's already a parent for command ${this.name}.`);
  }

  /**
   * Get the long description of the current command if exists
   * @returns - The long description of the current command
   */
  get getLongDescription(): string | undefined {
    return this.longDescription;
  }

  /**
   * Adds a new subcommand to current command
   * @param command - The command to add as subcommand
   */
  public addSubCommand(command: Command) {
    debug(
      `Add subcommand function called on ${this.name} to add ${command.name}`
    );
    this.subcommands.push(command);
    command.newParent = this;
  }

  /**
   * Adds a new flag to current command
   * @param flag - The flag to add
   */
  public addFlag(flag: Flag<any>) {
    const existingFlags = this.flags.filter(f => f.equals(flag));
    if (existingFlags.length === 0) {
      this.flags.push(flag);
      flag.newParent = this;
      return;
    }
    error(
      `Flag ${flag.name} already exists or ambigous. Matched flags are ${existingFlags}`
    );
    exit(1);
  }

  /**
   * Run the current command
   */
  public run(): void {
    let args: string[] = process.argv;

    if (this.parent === undefined) {
      // This is the main command: need to get the called file path
      const executableName: string = path.basename(args[1], '.js');
      // Check filename with the binary name
      if (executableName !== this.name) {
        error(
          `Root command name ${this.name} does not match with executable name: ${executableName}`
        );
        exit(1);
      }
      args = args.slice(2);
    } else {
      /*
       * If this is not the main command
       * find the index of the command in args
       */
      const cmdIndex: number = args.indexOf(this.name);
      args = args.slice(cmdIndex + 1);
    }
    if (
      args.length > 0 &&
      (args[0].toLowerCase() === 'help' ||
        args[0].toLowerCase() === '--help' ||
        args[0].toLowerCase() === '-h')
    ) {
      debug(`Show help page for command ${this.name}`);
      this.help();
      exit(0);
    }

    const moreIndex: number = args.indexOf('--');
    let moreArgs: string[] = [];
    if (moreIndex !== -1) {
      moreArgs = args.slice(moreIndex + 1);
      args = args.slice(0, moreIndex);
    }

    // Slice arguments until to the first command
    const presentSubCommands: Command[] = this.subcommands.filter(c => {
      debug(`Filtering subcommands of ${this.name}.`);
      debug(`Subcommand name: ${c.name}`);
      return args.indexOf(c.name) !== -1;
    });

    if (presentSubCommands.length > 1) {
      // If there's more than one command present this is an error
      error(`You can run one command at a time. Found: ${presentSubCommands}`);
      exit(1);
    }
    // The command that will be run
    let commandToRun: Command | undefined = undefined;
    debug(
      `Present sub-commands for command ${this.name} are ${presentSubCommands}`
    );
    if (presentSubCommands.length === 1) {
      debug(
        `There's one present sub command for command ${this.name}: ${presentSubCommands}`
      );
      // If there's only one comment present
      const commandIndex: number = args.indexOf(presentSubCommands[0].name);
      args = args.slice(0, commandIndex);
      commandToRun = presentSubCommands[0];
    }
    debug(`Arguments: ${args}`);
    const aargs: string[] = args;
    for (let i = 0; i < args.length; i++) {
      const arg: string = args[i];
      const pa: RegExpMatchArray | null = arg.match(
        /^(-\w|-{2}\w{2,})(=?(.+))?/
      );
      debug(`pa is ${pa}`);
      if (pa === null) {
        continue;
      }
      const fPart = pa[1];
      debug(`Flag part is ${fPart}`);
      const matchedFlags: Flag<any>[] = this.flags.filter(
        f => f.getLongForm === fPart || f.getShortForm === fPart
      );
      if (matchedFlags.length > 1) {
        error(`Flag ${fPart} matches with more than one flag ${matchedFlags}`);
        exit(1);
      }
      if (matchedFlags.length === 0) {
        continue;
      }
      // There's at least one matched flag
      const matchedFlag = matchedFlags[0];
      let vPart = pa[3];
      if (vPart === undefined) {
        if (!(matchedFlag.value instanceof Boolean)) {
          // If the value part is undefined and the flag not a type of boolean
          // Check the next argument is a flag
          if (i + 1 < args.length) {
            if (args[i + 1].match(/^(-\w|-{2}\w{2})/g) === null) {
              i++;
              vPart = args[i];
            } else {
              // If next argument is a flag
              if (matchedFlag instanceof BooleanFlag) {
                continue;
              }
              error('Missing value for flag ' + fPart);
              exit(1);
            }
          } else {
            if (matchedFlag instanceof BooleanFlag) {
              continue;
            }
            error('Missing value for flag ' + fPart);
            exit(1);
          }
        } else {
          // If the value part is undefined and the flag is type of boolean
        }
      }
      debug(`vPart is ${vPart}`);
      matchedFlag.updateValue(vPart);
      debug('Matched flag value');
      // this.flags[this.flags.map(e => e.name).indexOf(matchedFlag.name)] = matchedFlag;
      aargs.splice(aargs.indexOf(arg), 1);
    }
    args = aargs;

    const missingRequiredFlags: Flag<any>[] = this.flags.filter(
      f => f.isRequired && f.value === undefined
    );
    if (missingRequiredFlags.length > 0) {
      error(
        `${missingRequiredFlags
          .map(f => f.name)
          .join(',')} are missing but they were required`
      );
      this.help();
      exit(1);
    }
    const presentFlags: Flag<any>[] = this.flags.filter(
      f => f.value !== undefined
    );
    // If there's a pre-run run it before the run functioon
    if (this.preRun !== undefined) {
      try {
        this.preRun(
          args,
          presentFlags,
          commandToRun === undefined ? [] : moreArgs
        );
      } catch {
        error(`Pre-run function of the ${this.name} command failed`);
      }
    }
    debug('Number of present flags ' + presentFlags.length);

    this.runner(args, presentFlags, commandToRun === undefined ? [] : moreArgs);
    commandToRun?.run();

    // If there's a post-run run it after the run functioon
    if (this.postRun !== undefined) {
      try {
        this.postRun(
          args,
          presentFlags,
          commandToRun === undefined ? [] : moreArgs
        );
      } catch {
        error(`Post-run of the ${this.name} command failed`);
      }
    }
    exit(0);
  }

  /**
   * Show help page
   */
  private help() {
    const commandStack: Command[] = [];
    commandStack.unshift(this);
    let p: Command | undefined = this.parent;
    // Get all parent commands until root command
    while (p?.parent !== undefined && p.parent !== null) {
      commandStack.unshift(p);
      p = p.parent;
    }
    if (p !== undefined && p !== null) {
      commandStack.unshift(p);
    }
    help(commandStack);
  }
}
