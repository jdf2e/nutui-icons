import React, { FunctionComponent } from "react";
import { globalConfig, isSkyline, defaultProps, SVG_IconProps } from "./internal";
import IconSkyline from "./IconSkylineTemplate";

export { isSkyline, defaultProps };
export type { SVG_IconProps };


const Icon: FunctionComponent<SVG_IconProps> = (props: SVG_IconProps) => {
    if ((!process.env.TARO_ENV || process.env.TARO_ENV === 'weapp' || process.env.TARO_ENV === 'skyline') && isSkyline()) {
        return React.createElement(IconSkyline, props);
    }
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
        ariaRole,
        ariaLabel,
        ariaRoledescription,
        ariaHidden,
        ariaChecked,
        ariaSelected,
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
        return `${fallback ? globalConfig.fontClassName : ''} ${classPrefix} ${classPrefix}-${iconName} ${className || ''}`.trim()
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
        color,
        role: ariaRole,
        "aria-label": ariaLabel,
        "aria-roledescription": ariaRoledescription,
        "aria-hidden": ariaHidden,
        "aria-checked": ariaChecked,
        "aria-selected": ariaSelected
    }, children)
}
export default Icon
