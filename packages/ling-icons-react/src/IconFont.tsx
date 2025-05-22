import React, { ReactElement, ReactHTML } from 'react'
import {globalConfig} from "./internal";

export interface IconProps {
    name: string
    size: string | number
    classPrefix: string
    color: string
    tag: keyof ReactHTML
    onClick: (e: MouseEvent) => void
    fontClassName: string
    className: string
    style: React.CSSProperties
    children: React.ReactNode
}

const defaultProps = {
    name: '',
    size: '',
    color: '',
    onClick: (e: MouseEvent) => {},
    className: '',
} as IconProps

function pxCheck(value: string | number): string {
    return Number.isNaN(Number(value)) ? String(value) : `${value}px`
}

export default function Icon<T>(props: Partial<IconProps> & T): ReactElement {
    const {
        name,
        size,
        classPrefix = globalConfig.classPrefix,
        color,
        tag= globalConfig.tag,
        children,
        className,
        fontClassName= globalConfig.fontClassName,
        style,
        onClick,
        ...rest
    } = {
        ...defaultProps,
        ...props,
    }
    const isImage = name ? name.indexOf('/') !== -1 : false
    const type = isImage ? 'img' : tag

    const handleClick = (e: MouseEvent) => {
        if (onClick) {
            onClick(e)
        }
    }
    const hasSrc = () => {
        if (isImage) return { src: name }
        return {}
    }
    return React.createElement<any>(
        type,
        {
            className: isImage
                ? `${classPrefix}__img ${className || ''} `
                : `${fontClassName} ${classPrefix} ${classPrefix}-${name} ${
                    className || ''
                }`,
            style: {
                color,
                fontSize: pxCheck(size),
                width: pxCheck(size),
                height: pxCheck(size),
                ...style,
            },
            ...rest,
            onClick: handleClick,
            ...hasSrc(),
        },
        children
    )
}

Icon.displayName = 'NutIcon'
