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
    onClick?: (event: React.MouseEvent) => void
    children?: React.ReactNode
    fallback?: boolean
    ariaRole?: string
    ariaLabel?: string
    ariaRoledescription?: string
    ariaHidden?: boolean | "true" | "false"
    ariaChecked?: boolean | "true" | "false"
    ariaSelected?: boolean | "true" | "false"
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
    isSkyline: boolean | undefined
    skyline: boolean | undefined
} = {
    useSvg: true,
    classPrefix: 'nut-icon',
    tag: 'i',
    fontClassName: 'nutui-iconfont',
    isSkyline: undefined,
    skyline: undefined
}

declare const getCurrentPages: any;

// 检查当前是否运行在微信小程序 Skyline 引擎下
export const isSkyline = (): boolean => {
    if (typeof globalConfig.isSkyline === 'boolean') {
        return globalConfig.isSkyline;
    }
    if (typeof globalConfig.skyline === 'boolean') {
        return globalConfig.skyline;
    }
    if (typeof process !== 'undefined' && process.env.TARO_ENV === 'skyline') {
        return true;
    }
    if (typeof process !== 'undefined' && process.env.TARO_ENV && process.env.TARO_ENV !== 'weapp') {
        return false;
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

