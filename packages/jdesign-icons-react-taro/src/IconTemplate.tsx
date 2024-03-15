import {FunctionComponent} from "react";

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
    onClick?: (event: React.MouseEvent) => void
    children?: React.ReactNode
}

export const defaultProps = {
    className: '',
    style: undefined,
    name: '',
    width: '',
    height: '',
    size: '',
    svg64: '',
    onClick: () => undefined
} as SVG_IconProps

const Icon: FunctionComponent<SVG_IconProps> = (props: SVG_IconProps) => {
    const { className, style, name, color, width, height, size, svg64, onClick} = {...defaultProps, ...props}
    const handleClick: React.MouseEventHandler = (e) => {
        onClick && onClick(e)
    }
    const pxCheck = (value: string | number): string => {
        if(value === '') return ''
        return isNaN(Number(value)) ? String(value) : value + "px";
    };
    const classes = () => {
        return `nut-icon nut-icon-${name} ${className}`
    };
    const props2Style:any = {}
    const checkedWidth = pxCheck(width || size || '')
    const checkedHeight = pxCheck(height || size || '')
    if(checkedWidth) {
        props2Style['width'] = checkedWidth
    }
    if(checkedHeight) {
        props2Style['height'] = checkedHeight
    }
    const getStyle = () => {
        return {
            ...style,
            backgroundColor: color|| 'currentColor',
            mask: `url('${svg64}')  0 0/100% 100% no-repeat`,
            '-webkitMask': `url('${svg64}') 0 0/100% 100% no-repeat`,
            ...props2Style
        }
    }
    return <span
            className={classes()}
            style={getStyle()}
            onClick={handleClick}
            color={color}
        >{props.children}</span>
}
Icon.defaultProps = defaultProps
export default Icon
