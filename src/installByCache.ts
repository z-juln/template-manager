import { defaultItemOnInstalling, defaultOnInstalling } from './defaultHook';
import debug from './utils/debug';
import unzip from 'unzip';
import fs from 'fs-extra';
import extractZip from 'extract-zip';
import type TplManager from './TplManager';
import type { NormalPkg, Options, InstallOptions } from './type';

async function installByCache (
  this: TplManager,
  pkgs: NormalPkg[],
  options: InstallOptions,
  globalOptions: Options & { cacheDir: string },
) {
  if (typeof options.targetDir !== 'string' && !options.writeStream) {
    throw new Error('targetDir和writeStream必须存在一个');
  }
  const onInstalling = (globalOptions.onInstalling ?? defaultOnInstalling).bind(this);
  const itemOnInstalling = (globalOptions.itemOnInstalling ?? defaultItemOnInstalling).bind(this);

  const installItem = async (pkg: NormalPkg) => {
    debug('onItemInstalling...', pkg);
    const tgzPath = this.getCachePath(pkg.name);

    if (options.writeStream) {
      return (fs.createReadStream(tgzPath)
        .pipe(unzip.Parse()) as NodeJS.WriteStream)
        .pipe(options.writeStream);
    } else { // install
      debug('onItemInstalling...', pkg);
      const itemOnFinally = await itemOnInstalling(pkg, 'install');
      try {
        await extractZip(tgzPath, { dir: options.targetDir! });
        debug('onItemInstallFinally...', pkg);
        await itemOnFinally();
      } catch (error: any) {
        debug('onItemInstallError...', pkg, `${error}`, error?.stack);
        await itemOnFinally(error);
      }
    }
  };

  debug('onInstalling...');
  const onFinally = await onInstalling('install');
  try {
    await Promise.all(
      pkgs.map(installItem)
    );
    debug('onInstallFinally...');
    await onFinally();
  } catch (error: any) {
    debug('onInstallError...', `${error}`, error?.stack);
    await onFinally(error);
  }
};

export default installByCache;
