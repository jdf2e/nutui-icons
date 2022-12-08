import { App } from 'vue';
import Icon from '../Icon.vue';
import config from '../../../../iconfont/config.json';
function install(app: App) {
  app.component('Icon', Icon);
}
export { Icon, config };
export default { install, config };