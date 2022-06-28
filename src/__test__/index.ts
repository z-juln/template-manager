import TplManager from '..';
import fs from 'fs-extra';

const assert = (a: any, b: any) => {
  if (a !== b) {
    throw new Error(`assert:  ${a}!== ${b}`);
  }
};

const pkgName = '@pkg-tpl/tsx-rollup-jest';
const tplManager = new TplManager();

export async function testInstall() {
  await tplManager.install([pkgName], {
    registryURL: 'https://registry.npmmirror.com/',
  });
  
  const cachePath = tplManager.getCachePath(pkgName);
  assert(fs.existsSync(cachePath), true);
}

export async function caches() {
  const caches = await tplManager.getCaches();
  assert(caches.includes(pkgName), true);
}

export async function hasCache() {
  const hasCache = await tplManager.hasCache(pkgName);
  assert(hasCache, true);
}

testInstall();
caches();
hasCache();
