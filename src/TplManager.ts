import debug from './utils/debug';
import mergeOptions from './utils/mergeOptions';
import install from './install';
import fs from 'fs-extra';
import { dirname } from 'desm';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import type { InstallOptions } from './install';
import type { NormalPkg, Options, OptPkg } from './type';

const __dirname = dirname(import.meta.url);

const defaultOptions: Options & { cacheDir: string; } = {
  cacheDir: path.resolve(os.homedir(), '.tpl-manager'),
  updateNotifier: {
    // TODO custom notifyMessage
    notifyMessage: `
      (custom notifyMessage)\
      packageName: {packageName}\
      currentVersion: {currentVersion}\
      latestVersion: {latestVersion}
    `,
    boxenOptions: {},
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
    const pkgs = _pkgs.map<NormalPkg>(_pkg => {
      if (typeof _pkg === 'string') {
        return { name: _pkg, version: 'latest' };
      }
      return _pkg;
    });

    await this.registryNotify(pkgs);

    await install.call(this, pkgs, options, this.options);
  }
  
  getCachePath(name: string) {
    return path.resolve(this.options.cacheDir, name.replace('/', '+') + '.tgz');
  }

  async clean() {
    // TODO clean cache
  }

  async fetchPkgInfo() {
    // TODO fetchPkgInfo
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
