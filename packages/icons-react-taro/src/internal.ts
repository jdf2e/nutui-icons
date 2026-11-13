export type Configure = {
    useSvg?: boolean
    classPrefix?: string
    tag?: string
    fontClassName?: string
    isSkyline?: boolean
    skyline?: boolean
}
export type ConfigureKey = keyof Configure
export const globalConfig: {
    useSvg: boolean
    classPrefix: string
    tag: string
    fontClassName: string
    isSkyline: boolean
    skyline: boolean
} = {
    useSvg: true,
    classPrefix: 'nut-icon',
    tag: 'i',
    fontClassName: 'nutui-iconfont',
    isSkyline: typeof process !== 'undefined' && process.env.TARO_ENV === 'skyline',
    skyline: typeof process !== 'undefined' && process.env.TARO_ENV === 'skyline'
}

declare const getCurrentPages: any;

// 检查当前是否运行在微信小程序 Skyline 引擎下
export const isSkyline = (): boolean => {
    if (globalConfig.isSkyline || globalConfig.skyline) {
        return true;
    }
    if (typeof process !== 'undefined' && process.env.TARO_ENV === 'skyline') {
        return true;
    }
    try {
        if (typeof getCurrentPages === 'function') {
            const pages = getCurrentPages();
            const currentPage = pages[pages.length - 1];
            if (currentPage && (currentPage as any).renderer === 'skyline') {
                return true;
            }
        }
    } catch (e) {
        // ignore
    }
    return false;
};

