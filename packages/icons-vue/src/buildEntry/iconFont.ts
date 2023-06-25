import type { Component, App } from 'vue'
import IconFont from "../IconFont.vue"

type WithInstall<T> = T & {
  install(app: App): void
}

function withInstall<T extends Component>(options: T) {
  (options as any).name = 'IconFont';
  (options as any).install = (app: App) => {
    app.component('IconFont', options)
  }
  return options as WithInstall<T>
}

export default withInstall(IconFont)
