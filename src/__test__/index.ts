import TplManager from '..';
import fs from 'fs-extra';

const assert = (a: any, b: any) => {
  if (a !== b) {
    throw new Error(`assert:  ${a}!== ${b}`);
  }
};

export async function testInstall() {
  const pkgName = '@pkg-tpl/tsx-rollup-jest';
  const tplManager = new TplManager();
  await tplManager.install([pkgName], {
    registryURL: 'https://registry.npmmirror.com/',
  });
  
  const cachePath = tplManager.getCachePath(pkgName);
  assert(fs.existsSync(cachePath), true);
}

testInstall();
