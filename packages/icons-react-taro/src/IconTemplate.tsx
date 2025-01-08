import React, {CSSProperties, FunctionComponent} from "react";
import {globalConfig} from "./internal";
import * as process from "process";
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

const Icon: FunctionComponent<SVG_IconProps> = (props: SVG_IconProps) => {
    const classPrefix = globalConfig.classPrefix
    const {
        className,
        style,
        name,
        color,
        width,
        height,
        size,
        svg64,
        svgSrc,
        children,
        onClick,
        fallback = !globalConfig.useSvg
    } = {...defaultProps, ...props}
    const handleClick: React.MouseEventHandler = (e) => {
        onClick && onClick(e)
    }
    const pxCheck = (value: string | number): string => {
        if (value === '') return ''
        return isNaN(Number(value)) ? String(value) : value + "px";
    };
    const classes = () => {
        const iconName = fallback ? name?.toLowerCase() : name
        return `${fallback ? globalConfig.fontClassName : ''} ${classPrefix} ${classPrefix}-${iconName} ${className}`
    };
    const props2Style: any = {}
    const checkedWidth = pxCheck(width || size || '')
    const checkedHeight = pxCheck(height || size || '')
    if (checkedWidth) {
        props2Style['width'] = checkedWidth
    }
    if (checkedHeight) {
        props2Style['height'] = checkedHeight
    }
    const svg64Style: any = process.env.TARO_ENV === 'h5' ? {mask: `url('${svg64}')  0 0/100% 100% no-repeat`, 'WebkitMask': `url('${svg64}') 0 0/100% 100% no-repeat`,} : {
        mask: `url('${svg64}')  0 0/100% 100% no-repeat`,
        '-webkitMask': `url('${svg64}') 0 0/100% 100% no-repeat`,
    }
    const getStyle = () => {
        // const svg: CSSProperties = getSvg64()
        return {
            ...style,
            ...(fallback ? {} : {
                backgroundColor: color || 'currentColor',
                ...(svg64Style)
            }),
            ...props2Style
        }
    }
    return React.createElement<any>(globalConfig.tag, {
        className: classes(),
        style: getStyle(),
        onClick: handleClick,
        color
    }, children)
}
export default Icon
