import updateNotifier from 'update-notifier';
import mergeOptions from './utils/mergeOptions';
import latestVersion from 'latest-version';
import process from 'node:process';
import type { UpdateNotifierOpts } from './type';

(async () => {
  try {
    // Exit process when offline
    setTimeout(process.exit, 1000 * 30);
  
    await main();
  
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

async function main () {
  const {
    pkgs,
    opts,
  } = JSON.parse(process.argv[2]);

  for await (const pkg of pkgs) {
    const updateNotifierOpts: UpdateNotifierOpts = mergeOptions(
      opts,
      pkg.updateNotifier,
    );
    const notifier = updateNotifier({
      pkg: {
        name: pkg.name,
        version: await latestVersion(pkg.name),
      },
      shouldNotifyInNpmScript: true,
      distTag: updateNotifierOpts.distTag,
      updateCheckInterval: updateNotifierOpts.updateCheckInterval,
    });
    notifier.notify({
      message: updateNotifierOpts.notifyMessage,
      // @ts-ignore
      boxenOptions: updateNotifierOpts.boxenOptions,
    });
  }
}
