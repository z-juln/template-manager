import TplManager from '../TplManager';
import fs from 'fs-extra';

describe('TemplateManager', () => {
  it('install', (done) => {
    (async () => {
      const pkgName = '@pkg-tpl/tsx-rollup-jest';
      const tplManager = new TplManager();
      await tplManager.install([pkgName], {
        registryURL: 'https://registry.npmmirror.com/',
      });
      
      const cachePath = tplManager.getCachePath(pkgName);
      expect(fs.existsSync(cachePath)).toBe(true);
      done();
    })();
  });
});
