import boxen from 'boxen';
import semver from 'semver';
import type TplManager from './TplManager';
import type { PkgInfo, UpdateNotifierOpts } from './type';

async function checkUpdate(this: TplManager, pkgs: string[]) {
  const opts = this.options.updateNotifier ?? {};
  const { boxenOptions } = opts;

  const pkgInfos = pkgs.map(pkg => this.fetchPkgInfo(pkg));
  const notifyMessages = (
    await Promise.all(
      pkgInfos.map(info => checkUpdateItem(info, opts))
    )
  ).filter(Boolean);

  return boxen(
    notifyMessages.join('\n'),
    boxenOptions,
  );
}

async function checkUpdateItem(pkgInfo: PkgInfo, opts?: UpdateNotifierOpts) {
  const updateCheckInterval = opts?.updateCheckInterval ?? 0;
  const optNotifyMessage = opts?.notifyMessage;
  
  if (Date.now() - +pkgInfo.lastUpdateCheck < updateCheckInterval) {
    return;
  }

  let notifyMessage: string;
  if (typeof optNotifyMessage === 'string') {
    notifyMessage = optNotifyMessage;
  } else {
    notifyMessage = optNotifyMessage?.(pkgInfo) ?? '';
  }

  if (
    pkgInfo.latest && pkgInfo.current
    && semver.gt(pkgInfo.latest, pkgInfo.current)
  ) {
    return notifyMessage;
  }

  return null;
}

export default checkUpdate;
