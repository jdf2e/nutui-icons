import React, {FunctionComponent, ReactElement, ReactHTML} from 'react'

export interface IconFontProps {
    name?: string
    size?: string | number
    width?: string | number
    height?: string | number
    classPrefix?: string
    color?: string
    tag?: keyof ReactHTML
    onClick?: (e: MouseEvent) => void
    fontClassName?: string
    className?: string
    style?: React.CSSProperties
    children?: React.ReactNode
}

const defaultProps = {
    name: '',
    size: '',
    width: '',
    height: '',
    classPrefix: 'nut-icon',
    fontClassName: 'nutui-iconfont',
    color: '',
    tag: 'i',
    onClick: (e: MouseEvent) => {
    },
    className: '',
} as IconFontProps

function pxCheck(value: string | number): string {
    return Number.isNaN(Number(value)) ? String(value) : `${value}px`
}

const Icon: FunctionComponent<IconFontProps> = (props: IconFontProps) => {
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
    const type = isImage ? 'img' : (tag || 'i')

    const handleClick = (e: MouseEvent) => {
        if (onClick) {
            onClick(e)
        }
    }
    const hasSrc = () => {
        if (isImage) return {src: name}
        return {}
    }
    const pxChecked = pxCheck(size || '')
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
                ...(pxChecked ? {
                    fontSize: pxChecked,
                    width: pxChecked,
                    height: pxChecked,
                } : {}),
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

export default Icon
