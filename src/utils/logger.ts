import chalk from "chalk";

export default class Logger {
  public static Debug(...data: unknown[]): void {
    console.log(
      chalk.gray(`[${new Date().toLocaleString()}]`),
      chalk.bold(chalk.magenta("[DEBUG]")),
      ...this.Map(data),
    );
  }
  public static Info(...data: unknown[]): void {
    console.log(
      chalk.gray(`[${new Date().toLocaleString()}]`),
      chalk.bold(chalk.cyan("[INFO]")),
      ...this.Map(data),
    );
  }
  public static Notice(...data: unknown[]): void {
    console.log(
      chalk.gray(`[${new Date().toLocaleString()}]`),
      chalk.bold(chalk.green("[NOTICE]")),
      ...this.Map(data),
    );
  }
  public static Warn(...data: unknown[]): void {
    console.log(
      chalk.gray(`[${new Date().toLocaleString()}]`),
      chalk.bold(chalk.yellow("[WARN]")),
      ...this.Map(data),
    );
  }
  public static Error(...data: unknown[]): void {
    console.log(
      chalk.gray(`[${new Date().toLocaleString()}]`),
      chalk.bold(chalk.red("[ERROR]")),
      ...this.Map(data),
    );
  }
  public static Fatal(...data: unknown[]): void {
    console.log(
      chalk.gray(`[${new Date().toLocaleString()}]`),
      chalk.bold(chalk.bgRed("[FATAL]")),
      ...this.Map(data),
    );
    process.exit(1);
  }

  private static Map(values: unknown[]): unknown[] {
    const mapped: unknown[] = [];

    for (const value of values) {
      switch (typeof value) {
        case "string":
          mapped.push(chalk.yellow(value));
          break;
        case "boolean":
          mapped.push(
            value === true ? chalk.green("true") : chalk.red("false"),
          );
          break;
        case "number":
          mapped.push(chalk.magenta(value));
          break;
        case "object":
          mapped.push(chalk.blue(JSON.stringify(value, null, 2)));
          break;
        default:
          mapped.push(value);
      }
    }

    return mapped;
  }
}
