export type Configure = {
    classPrefix?: string
    tag?: string
    fontClassName?: string
}
export type ConfigureKey = keyof Configure
export const globalConfig = {
    classPrefix: 'nut-icon',
    tag: 'i',
    fontClassName: 'nutui-iconfont'
}
