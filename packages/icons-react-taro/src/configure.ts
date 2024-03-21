import {Configure, ConfigureKey, globalConfig} from "./internal";

export function configure(config: Configure) {
    if (typeof config === 'object' && config !== null) {
        let key: ConfigureKey
        for (key in config) {
            if (config.hasOwnProperty(key) && config[key]) {
                // @ts-ignore
                globalConfig[key] = config[key]
            }
        }
    }
}