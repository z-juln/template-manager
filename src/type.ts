import type TplManager from './TplManager';
import type { Options as BoxenOptions } from 'boxen';
import type { Difference as SemverDiff } from 'semver-diff';

export interface NormalPkg {
  name: string;
  version: string;
  registryURL?: string;
  updateNotifier?: UpdateNotifierOpts | null;
}

export type OptPkg = string | NormalPkg;

export interface UpdateNotifierOpts {
  disable?: boolean;
  defer?: boolean;
  distTag?: string;
  updateCheckInterval?: number;
  notifyMessage?: string | ((pkgInfo: PkgInfo & { name: string }) => string);
  boxenOptions?: BoxenOptions;
}

export type Hook = 'cache' | 'install';

export interface Options {
  cacheDir?: string;
  onInstalling?: (this: TplManager, hook: Hook) => Promise<(error?: any) => Promise<void>>;
  itemOnInstalling?: (this: TplManager, pkg: NormalPkg, hook: Hook) => Promise<(error?: any) => Promise<void>>;
  updateNotifier?: UpdateNotifierOpts;
  registryURL?: string;
}

export interface InstallOptions {
  writeStream?: NodeJS.WritableStream;
  targetDir?: string;
  registryURL?: string;
  debug?: boolean;
}

export interface PkgInfo {
  latest?: string;
  current?: string;
  lastUpdateCheck: string;
  type?: SemverDiff;
  name: string;
}
