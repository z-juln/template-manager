import sysRegistryUrl from 'registry-url';
import debug from './utils/debug';
import { fetchPkg } from 'fetch-pkg';
import fs from 'fs-extra';
import type TplManager from './TplManager';
import type { NormalPkg, Options } from './type';

export interface InstallOptions {
  registryURL?: string;
  debug?: boolean;
}

// TODO 1: ora
// TODO 2: 从缓存中获取

async function install (
  this: TplManager,
  pkgs: NormalPkg[],
  options: InstallOptions,
  globalOptions: Options & { cacheDir: string },
) {
  const registryURL = globalOptions.registryURL ?? options.registryURL ?? sysRegistryUrl();
  const onInstalling = globalOptions.onInstalling ?? defaultOnInstalling;
  const itemOnInstalling = globalOptions.itemOnInstalling ?? defaultItemOnInstalling;
  
  const installItem = async (pkg: NormalPkg) => {
    const itemOnFinally = await itemOnInstalling(pkg);
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
          await itemOnFinally();
          // @ts-ignore
          resolve(...args);
        })
        .once('error', async (error) => {
          await itemOnFinally(error);
          reject();
        });
    });
  };

  const onFinally = await onInstalling();
  try {
    await Promise.all(
      pkgs.map(installItem)
    );
    await onFinally();
  } catch (error) {
    await onFinally(error);
  }
};

export const defaultOnInstalling = async () => {
  // TODO ora
  debug('onInstall...');
  return async (error?: any) => {
    if (error) {
      debug('onError...', { error });
    }
  };
}

export const defaultItemOnInstalling = async (pkg: NormalPkg) => {
  debug('itemOnInstall', pkg);
  return async (error?: any) => {
    if (error) {
      debug('itemOnFinally', { error });
    }
  };
}

export default install;
