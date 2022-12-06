import { App } from 'vue';
import config from '../package.json';
import Icon from './Icon.vue';

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


export { install, Icon };
export default { install, version: config.version };