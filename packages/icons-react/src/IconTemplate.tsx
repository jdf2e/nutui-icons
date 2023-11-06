
import classnames from 'classnames'
import {FunctionComponent} from "react";

export interface SVG_IconProps {
    className?: string
    style?: React.CSSProperties
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
    name: '',
    width: '',
    height: '',
    onClick: () => undefined
} as SVG_IconProps

const Icon: FunctionComponent<SVG_IconProps> = (props: SVG_IconProps) => {
    const {className, style, name, color, width, height, onClick} = {...defaultProps, ...props}
    const handleClick: React.MouseEventHandler = (e) => {
        onClick && onClick(e)
    }
    const pxCheck = (value: string | number): string => {
        if(value === '') return ''
        return isNaN(Number(value)) ? String(value) : value + "px";
    };
    const classes = () => {
        const prefixCls = "nut-icon";
        return classnames({
            [`${className}`]: className,
            [prefixCls]: true,
            [prefixCls + "-" + name]: name,
        })
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
            viewBox="0 0 1024 1024"
            aria-labelledby={name}
            role="presentation"
        >
            {props.children}
        </svg>
    </>
}
Icon.defaultProps = defaultProps
export default Icon
