# Yet Another Cli Library

A NodeJS / TypeScript framework to implement complex command line applications

## Installation

```bash
npm install yacl
```

## Creating your first CLI


All CLIs should have a main command (which is called from terminal) and subcommands and flags of this root command. Assuming that you have a `cli.ts` file which will be executed when your CLI called from terminal. 

Let's start with creating this main command:

### Creating the main command

A basic `cli.ts` file looks like as follows

```TypeScript
#!/usr/bin/env node
import { Command } from 'yacl';

const main: Command = new Command({
  name: 'example-cli',
  description: 'An example CLI built by yacl',
  longDescription: '',
  run: () => {
    console.log('example-cli command called');
  },
});

main.run();
```

The main command name should match the `bin` script name in your `package.json`. 

```json
  ...
  "bin": {
    "example-cli": "dist/cli.js"
  },
  ...
```

Once you have created your first main command you can subcommands and flags and add them to a command with `addCommand` and `addFlag` functions respectively.

### Creating subcommands

A subcommand is a `Command` that which has a parent command. The unique difference between a subcommand and a main command is that a main command has no parents. So to create a subcommand you can just use the `Command` constructor and add your command to its parent with `addCommand` function.

### Creating flags

There can be two different flags. One that contains a value and the other that indicates boolean. For the first one you can use `Flag` class constructor and for the second one you can use `BooleanFlag` class.

A basic Flag looks like this:

```TypeScript
new Flag<string[]>({
  name: 'ids',
  required: true,
  parser: (strValue: string) => ({
    error: undefined,
    result: strValue.split(','),
  }),
  longForm: 'id',
  shortForm: 'i',
  usage: '--id <id1>,<id2>,<id3>',
})
```

A basic boolean flag can be created as follows:

```TypeScript
new BooleanFlag({
  name: 'Headless mode',
  longForm: 'headless',
});
```

You can add these flags to a command using `addFlag` function on the parent command.

## Documentation

For further information you can refer to the [documentation](https://yacl.dev)