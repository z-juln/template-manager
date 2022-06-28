import chalk from 'chalk';

const info = (...args: any[]) => console.log(chalk.blue('tpl-manager: '), ...args);
const error = (...args: any[]) => console.log(chalk.red('tpl-manager: '), ...args);
const plain = console.log;

const log = {
  info,
  error,
  plain,
};

export default log;
