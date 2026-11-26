import React from 'react'

export interface SVG_IconProps {
    className?: string
    style?: React.CSSProperties
    viewBox?: string
    name?: string
    color?: string
    width?: string | number
    height?: string | number
    size?: string | number
    svg64?: string
    svgSrc?: string
    ariaRole?: string
    ariaLabel?: string
    ariaRoledescription?: string
    ariaHidden?: boolean
    ariaChecked?: boolean
    ariaSelected?: boolean
    onClick?: (event: React.MouseEvent) => void
    children?: React.ReactNode
    fallback?: boolean
}

export const defaultProps = {
    className: '',
    style: undefined,
    name: '',
    width: '',
    height: '',
    size: '',
    svg64: '',
    svgSrc: '',
    onClick: () => undefined
} as SVG_IconProps

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
    isSkyline?: boolean
    skyline?: boolean
} = {
    useSvg: true,
    classPrefix: 'nut-icon',
    tag: 'i',
    fontClassName: 'nutui-iconfont'
}

