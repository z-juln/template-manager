import { defaultItemOnInstalling, defaultOnInstalling } from './defaultHook';
import debug from './utils/debug';
import sysRegistryUrl from 'registry-url';
import { fetchPkg } from 'fetch-pkg';
import fs from 'fs-extra';
import type TplManager from './TplManager';
import type { NormalPkg, Options, InstallOptions } from './type';

async function cachePkg (
  this: TplManager,
  pkgs: NormalPkg[],
  options: InstallOptions,
  globalOptions: Options & { cacheDir: string },
) {
  const registryURL = globalOptions.registryURL ?? options.registryURL ?? sysRegistryUrl();
  const onInstalling = (globalOptions.onInstalling ?? defaultOnInstalling).bind(this);
  const itemOnInstalling = (globalOptions.itemOnInstalling ?? defaultItemOnInstalling).bind(this);
  
  const cacheItem = async (pkg: NormalPkg) => {
    debug('onItemCacheing...', pkg);
    const itemOnFinally = await itemOnInstalling(pkg, 'cache');
    const tgzPath = this.getCachePath(pkg.name);

    const worker = await fetchPkg(pkg.name, {
      version: pkg.version,
      registryURL: pkg.registryURL ?? registryURL,
      // TODO install token
      token: undefined,
    });
    return new Promise<any>((resolve, reject) => {
      worker.pipe(
        fs.createWriteStream(tgzPath)
      )
        .once('finish', async (...args: any[]) => {
          debug('onItemCacheFinally...', pkg);
          await itemOnFinally();
          // @ts-ignore
          resolve(...args);
        })
        .once('error', async (error: any) => {
          debug('onItemCacheError...', pkg, `${error}`, error?.stack);
          await itemOnFinally(error);
          reject();
        });
    });
  };

  debug('onCacheing...');
  const onFinally = await onInstalling('cache');
  try {
    await Promise.all(
      pkgs.map(cacheItem)
    );
    debug('onCacheFinally...');
    await onFinally();
  } catch (error: any) {
    debug('onCacheError...', `${error}`, error?.stack);
    await onFinally(error);
  }
};

export default cachePkg;
