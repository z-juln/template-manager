import debug from './utils/debug';
import mergeOptions from './utils/mergeOptions';
import cachePkg from './cachePkg';
import installByCache from './installByCache';
import checkUpdate from './checkUpdate';
import log from './utils/log';
import chalk from 'chalk';
import Configstore from 'configstore';
import rimraf from 'rimraf';
import fs from 'fs-extra';
import { dirname } from 'desm';
import glob from 'glob';
import os from 'node:os';
import path from 'node:path';
import { format } from 'node:util';
import { spawn } from 'node:child_process';
import type { NormalPkg, Options, OptPkg, InstallOptions, PkgInfo } from './type';
import type { Difference as SemverDiff } from 'semver-diff';

const __dirname = dirname(import.meta.url);

const defaultOptions: Options & { cacheDir: string; } = {
  cacheDir: path.resolve(os.homedir(), '.tpl-manager'),
  updateNotifier: {
    disable: false,
    // TODO custom notifyMessage
    notifyMessage: (pkgInfo) =>
      chalk.yellow(format(' %s update check failed ', pkgInfo.name))
      + format('\n Try running with %s or get access ', chalk.cyan('sudo'))
      + '\n to the local update config store via \n'
      + chalk.cyan(format(' sudo chown -R $USER:$(id -gn $USER) %s ')),
    boxenOptions: {},
    updateCheckInterval: 0,
  },
};

class TplManager {
  options: Options & { cacheDir: string; };

  constructor(options?: Options) {
    this.options = mergeOptions(defaultOptions, options);
    debug('options: ', this.options);

    // prepare
    fs.ensureDirSync(this.options.cacheDir);
  }

  async install(_pkgs: OptPkg[], options: InstallOptions = {}) {
    const caches = await this.getCaches();
    const pkgs = _pkgs.map<NormalPkg>(_pkg => {
      if (typeof _pkg === 'string') {
        return { name: _pkg, version: 'latest' };
      }
      return _pkg;
    });
    const noCachedPkgs = pkgs.filter(pkg => !caches.includes(pkg.name));

    await this.cachePkg(noCachedPkgs);
    await this.installByCache(pkgs);
  }

  private async installByCache(pkgs: NormalPkg[], options: InstallOptions = {}) {
    // check update
    if (!this.options.updateNotifier?.disable) {
      try {
        const message = this.checkUpdate(pkgs.map(pkg => pkg.name));
        log.plain(message);
      } catch (error: any) {
        log.error(error, error?.stack);
      }
    }

    // install
    await installByCache.call(this, pkgs, options, this.options);
  }

  checkUpdate = checkUpdate.bind(this);

  async cleanCache(this: TplManager, pkgName?: string) {
    let target: string;
    if (pkgName) {
      if (await this.hasCache(pkgName)) {
        target = this.getCachePath(pkgName);
      } else {
        throw new Error('该cache不存在');
      }
    } else {
      target = this.options.cacheDir;
    }
    rimraf.sync(target);
  }

  getCaches() {
    return new Promise<string[]>((resolve, reject) => {
      glob(path.resolve(this.options.cacheDir, './*'), (err, matches) => {
        if (err) {
          reject(err);
          return;
        }
        const caches = matches
          .filter(match => match.endsWith('.tgz'))
          .map(match => path.parse(match).name)
          .map(match => match.replace('+', '/'));
        resolve(caches);
      });
    });
  }

  private async cachePkg(pkgs: NormalPkg[], options: InstallOptions = {}) {
    await this.registryNotify(pkgs);

    await cachePkg.call(this, pkgs, options, this.options);
  }
  
  getCachePath(name: string) {
    return path.resolve(this.options.cacheDir, name.replace('/', '+') + '.tgz');
  }

  async hasCache(this: TplManager, pkgName: string) {
    const caches = await this.getCaches();
    return caches.includes(pkgName);
  }

  fetchPkgInfo(pkgName: string): PkgInfo {
    const congigStore = new Configstore(`update-notifier-${pkgName}`);
    const lastUpdateCheck = congigStore.get('lastUpdateCheck');
    const update = congigStore.get('update') as {
      latest: string;
      current: string;
      type: SemverDiff;
      name: string;
    } | undefined;

		return {
      ...update,
      lastUpdateCheck,
			name: pkgName,
		};
  }

  private async registryNotify(pkgs: NormalPkg[]) {
    if (!this.options.updateNotifier) return;

    pkgs = pkgs.filter(pkg => !!pkg.updateNotifier);

    spawn(
      process.execPath,
      [
        path.join(__dirname, 'notifier'),
        JSON.stringify({
          pkgs,
          opts: this.options.updateNotifier,
        }),
      ],
      {
        detached: true,
        stdio: 'inherit',
      },
    ).unref();
  }
}

export default TplManager;
