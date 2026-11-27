import React, { FunctionComponent } from "react";
import { globalConfig, defaultProps, SVG_IconProps } from "./internal";
import { Image } from "@tarojs/components";

export { defaultProps };
export type { SVG_IconProps };

const Icon: FunctionComponent<SVG_IconProps> = (props: SVG_IconProps) => {
  const classPrefix = globalConfig.classPrefix;
  const {
    className,
    style,
    name,
    color,
    width,
    height,
    size,
    svgSrc,
    children,
    onClick,
    ariaRole,
    ariaLabel,
    ariaRoledescription,
    ariaHidden,
    ariaChecked,
    ariaSelected,
    fallback = !globalConfig.useSvg,
  } = { ...defaultProps, ...props };
  const handleClick: React.MouseEventHandler = (e) => {
    onClick && onClick(e);
  };

  const pxCheck = (value: string | number): number => {
    if (value === "") return 0;
    return parseInt(value as string);
  };
  const classes = () => {
    const iconName = fallback ? name?.toLowerCase() : name;
    return `${
      fallback ? globalConfig.fontClassName : ""
    } ${classPrefix} ${classPrefix}-${iconName} ${className}`;
  };
  const props2Style: any = {};
  const checkedWidth = pxCheck(width || size || "");
  const checkedHeight = pxCheck(height || size || "");
  if (checkedWidth) {
    props2Style["width"] = checkedWidth;
  }
  if (checkedHeight) {
    props2Style["height"] = checkedHeight;
  }
  const getStyle = () => {
    return {
      ...style,
      ...props2Style,
      color,
    };
  };

  return React.createElement<any>(
    Image,
    {
      src: svgSrc,
      className: classes(),
      style: getStyle(),
      onClick: handleClick,
      svg: true,
      ariaRole,
      ariaLabel,
      ariaRoledescription,
      ariaHidden,
      ariaChecked,
      ariaSelected,
    },
    children
  );
};
export default Icon;
