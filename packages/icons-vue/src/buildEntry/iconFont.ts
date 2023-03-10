import { type App } from 'vue'
import IconFont from "../IconFont.vue"
const withInstall = (options: any) => {
  options.install = (app: App) => {
    app.component('IconFont', options)
  }
  return options
}
export default withInstall(IconFont)
