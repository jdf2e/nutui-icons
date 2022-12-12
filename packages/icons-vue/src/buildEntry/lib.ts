import { App } from 'vue';
import IconFont from '../IconFont.vue';
import config from '../../../../iconfont/config.json';
function install(app: App) {
  app.component('IconFont', IconFont);
}
export { IconFont, config };
export default { install, config };