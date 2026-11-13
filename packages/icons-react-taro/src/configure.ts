import {Configure, ConfigureKey, globalConfig} from "./internal";

export function configure(config: Configure) {
    if (typeof config === 'object' && config !== null) {
        let key: ConfigureKey
        for (key in config) {
            if (config.hasOwnProperty(key) && config[key] !== undefined) {
                // @ts-ignore
                globalConfig[key] = config[key]
            }
        }
        if (config.isSkyline !== undefined) {
            globalConfig.skyline = config.isSkyline
        } else if (config.skyline !== undefined) {
            globalConfig.isSkyline = config.skyline
        }
    }
}