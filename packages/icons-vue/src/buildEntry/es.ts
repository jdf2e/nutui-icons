import { App } from 'vue';
import Icon from '../Icon.vue';
import config from '../../../../iconfont/config.json';
function install(app: App) {
  const packages = [Icon];
  packages.forEach((item: any) => {
    if (item.install) {
      app.use(item);
    } else if (item.name) {
      app.component(item.name, item);
    }
  });
}
export { config };
export default { install, config };