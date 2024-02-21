export type Configure = {
    useSvg?: boolean
    classPrefix?: string
    tag?: string
    fontClassName?: string
}
export type ConfigureKey = keyof Configure
export const globalConfig = {
    useSvg: true,
    classPrefix: 'nut-icon',
    tag: 'i',
    fontClassName: 'nutui-iconfont'
}
