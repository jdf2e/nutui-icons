import {FunctionComponent} from "react";
import {globalConfig} from "./internal";

export interface SVG_IconProps {
    className?: string
    style?: React.CSSProperties
    viewBox?: string
    name?: string
    color?: string
    width?: string | number
    height?: string | number
    onClick?: (event: React.MouseEvent) => void
    children?: React.ReactNode
}

export const defaultProps = {
    className: '',
    style: undefined,
    viewBox: ' 0 0 1024 1024',
    name: '',
    width: '',
    height: '',
    onClick: () => undefined
} as SVG_IconProps

const Icon: FunctionComponent<SVG_IconProps> = (props: SVG_IconProps) => {
    const classPrefix = globalConfig.classPrefix
    const {viewBox, className, style, name, color, width, height, children, onClick} = {...defaultProps, ...props}
    const handleClick: React.MouseEventHandler = (e) => {
        onClick && onClick(e)
    }
    const pxCheck = (value: string | number): string => {
        if(value === '') return ''
        return isNaN(Number(value)) ? String(value) : value + "px";
    };
    const classes = () => {
        return `${classPrefix} ${classPrefix}-${name} ${className}`
    };
    const props2Style:any = {}
    const checkedWidth = pxCheck(width || '')
    const checkedHeight = pxCheck(height || '')
    if(checkedWidth) {
        props2Style['width'] = checkedWidth
    }
    if(checkedHeight) {
        props2Style['height'] = checkedHeight
    }
    const getStyle = () => {
        return {
            color,
            ...style,
            ...props2Style
        }
    }
    return <>
        <svg
            className={classes()}
            style={getStyle()}
            onClick={handleClick}
            xmlns="http://www.w3.org/2000/svg"
            color={color}
            viewBox={viewBox}
            aria-labelledby={name}
            role="presentation"
        >
            {children}
        </svg>
    </>
}
export default Icon
