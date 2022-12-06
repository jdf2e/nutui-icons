import { App } from 'vue';
import pkgConfig from '../package.json';
import Icon from './Icon.vue';
import config from './iconfont/config.json';
const version = pkgConfig.version;
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


export { install, Icon, config, version };
export default { install, version, config };