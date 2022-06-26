# tpl-manager
cli专用，支持模板下载管理、缓存管理等操作

## api
```typescript
class TplManager {
  constructor(options) {

  }

  install(targets: string[]) {

  }

  clean() {
    // 清除缓存
  }
}
```
options:
  提示更新: notifier: null | string
  自动更新: autoUpdate: boolean
  boxen配置: boxenOptions
