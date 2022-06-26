import type { Options as BoxenOptions } from 'boxen';

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
  notifyMessage?: string;
  boxenOptions?: BoxenOptions;
}

export interface Options {
  cacheDir?: string;
  onInstalling?: () => Promise<(error?: any) => Promise<void>>;
  itemOnInstalling?: (pkg: NormalPkg) => Promise<(error?: any) => Promise<void>>;
  updateNotifier?: UpdateNotifierOpts | null;
  registryURL?: string;
}
