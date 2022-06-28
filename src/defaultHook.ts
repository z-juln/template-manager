import log from "./utils/log";
import ora from "ora";
import type TplManager from "./TplManager";
import type { Hook, NormalPkg, Options } from './type';

export const defaultOnInstalling: NonNullable<Options['onInstalling']> =
  async function(this: TplManager, hook: Hook) {
    const hookText = hook === 'install' ? '安装' : '缓存';
    const spinner = ora(`正在${hookText}...`).start();
    return async (error) => {
      spinner.stop();
      if (error) {
        // info('出现了一点问题: ', `${error}`, error?.stack);
      } else {
        log.info(`${hookText}完毕!`);
      }
    };
  }

export const defaultItemOnInstalling: NonNullable<Options['itemOnInstalling']> =
  async function(this: TplManager, pkg: NormalPkg, hook: Hook) {
    const hookText = hook === 'install' ? '安装' : '缓存';
    const cachePath = this.getCachePath(pkg.name);
    if (hook === 'cache') {
      log.info(`正在将${pkg.name}@${pkg.version}缓存到${cachePath}`);
    } else {
      log.info(`正在安装${pkg.name}(来自缓存${cachePath})`);
    }
    return async (error) => {
      if (error) {
        log.error(`${hookText}${pkg.name}出现了一点问题: `, `${error}`, error?.stack);
      } else {
        log.info(`${hookText}${pkg.name}完毕!`);
      }
    };
  }
