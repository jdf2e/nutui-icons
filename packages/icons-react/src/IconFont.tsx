import React, { ReactElement, ReactHTML } from 'react'

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
    classPrefix: 'nut-icon',
    fontClassName: 'nutui-iconfont',
    color: '',
    tag: 'i',
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
        classPrefix,
        color,
        tag,
        children,
        className,
        fontClassName,
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
                ? `nut-icon__img ${className || ''} `
                : `${fontClassName} nut-icon ${classPrefix}-${name} ${
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

Icon.defaultProps = defaultProps
Icon.displayName = 'NutIcon'
