import {Flag} from './flag';

export class BooleanFlag extends Flag<boolean> {
  /**
   * Creates a new object BoolenFlag
   * @param options - Options that will be used to create a boolean flag
   */
  constructor(options: {name: string; longForm: string});
  /**
   * Creates a new object BoolenFlag
   * @param options - Options that will be used to create a boolean flag
   */
  constructor(options: {name: string; shortForm: string; longForm: string});
  /**
   * Creates a new object BoolenFlag
   * @param options - Options that will be used to create a boolean flag
   */
  constructor(options: {name: string; longForm: string; defaultValue: boolean});
  /**
   * Creates a new object BoolenFlag
   * @param options - options that will be used to create a boolean flag
   */
  constructor(options: {
    name: string;
    shortForm: string;
    longForm: string;
    defaultValue: boolean;
  });
  /**
   * Creates a new object BoolenFlag
   * @param options - options that will be used to create a boolean flag
   */
  constructor(options: {
    name: string;
    shortForm: string;
    longForm: string;
    defaultValue: boolean;
  }) {
    /**
     * If there is no defaultValue on parameters it will be initialized to false
     */
    const dv: boolean = options.defaultValue ?? false;
    super({
      name: options.name,
      defaultValue: dv,
      shortForm: options.shortForm,
      longForm: options.longForm,
      parser: () => ({error: undefined, result: !dv}),
      usage: '',
      required: false,
    });
  }
}
