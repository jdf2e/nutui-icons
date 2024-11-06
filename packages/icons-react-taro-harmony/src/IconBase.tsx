interface IconProps {
    className?: string
    style?: React.CSSProperties
    name: string
    color?: string
    width?: string | number
    height?: string | number
    onClick: (event: React.MouseEvent) => void
}

const defaultProps = {
    className: '',
    style: undefined,
    name: '',
    width: '',
    height: '',
    onClick: () => undefined
} as IconProps

const Add = (props: IconProps) => {
    const {className, style, name, color, width, height, onClick} = {...defaultProps, ...props}
    const handleClick: React.MouseEventHandler = (e) => {
        onClick && onClick(e)
    }
    const pxCheck = (value: string | number): string => {
        return isNaN(Number(value)) ? String(value) : value + "px";
    };
    const classes = () => {
        return `nut-icon nut-icon-${name} ${className}`
    };
    const getStyle = () => {
        return {
            ...style,
            backgroundImage: `url('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path d="M888.686 917.943h-204.8c-29.257 0-54.857-25.6-54.857-54.857s25.6-54.857 54.857-54.857h201.143c29.257 0 54.857 25.6 54.857 54.857s-21.943 54.857-51.2 54.857zm-102.4 98.743c-29.257 0-54.857-21.943-54.857-54.857V760.686c0-29.257 25.6-54.857 54.857-54.857s54.857 25.6 54.857 54.857v201.143c0 32.914-25.6 54.857-54.857 54.857zM208.457 1024H204.8c-29.257-3.657-51.2-29.257-51.2-58.514 14.629-149.943 142.629-270.629 292.571-270.629 29.258 0 54.858 25.6 54.858 54.857s-25.6 54.857-54.858 54.857c-95.085 0-175.542 73.143-186.514 168.229 0 29.257-25.6 51.2-51.2 51.2zM475.43 548.571c-43.886 0-87.772-21.942-117.029-54.857-18.286-21.943-14.629-58.514 7.314-76.8 21.943-18.285 58.515-14.628 76.8 7.315 14.629 18.285 43.886 18.285 58.515 0 18.285-21.943 54.857-29.258 76.8-7.315 21.942 18.286 29.257 54.857 7.314 76.8-21.943 32.915-65.829 54.857-109.714 54.857zm0 256c-223.086 0-402.286-179.2-402.286-402.285S252.343 0 475.429 0s402.285 179.2 402.285 402.286c0 58.514-14.628 117.028-36.571 171.885-14.629 25.6-43.886 40.229-73.143 25.6-25.6-14.628-40.229-43.885-25.6-73.142 18.286-40.229 29.257-80.458 29.257-124.343 0-160.915-131.657-292.572-292.571-292.572S186.514 241.371 186.514 402.286s131.657 292.571 292.572 292.571c14.628 0 32.914 0 47.543-3.657 29.257-3.657 58.514 14.629 62.171 43.886 3.657 29.257-14.629 58.514-43.886 62.171-25.6 7.314-47.543 7.314-69.485 7.314z" fill="${color}" fillOpacity="0.9"></path></svg>')`,
            height: pxCheck(height || ''),
            width: pxCheck(width || '')
        }
    }
    return <>
        <span
            className={classes()}
            style={getStyle()}
            onClick={handleClick}
            color={color}
        ></span>
    </>
}
export default Add
