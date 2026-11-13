import React, { FunctionComponent } from "react";
import { globalConfig } from "./internal";
import { Image } from "@tarojs/components";

export interface SVG_IconProps {
  className?: string;
  style?: React.CSSProperties;
  viewBox?: string;
  name?: string;
  color?: string;
  width?: string | number;
  height?: string | number;
  size?: string | number;
  svg64?: string;
  svgSrc?: string;
  onClick?: (event: React.MouseEvent) => void;
  children?: React.ReactNode;
  fallback?: boolean;
  ariaRole?: string;
  ariaLabel?: string;
  ariaRoledescription?: string;
  ariaHidden?: boolean | "true" | "false";
  ariaChecked?: boolean | "true" | "false";
  ariaSelected?: boolean | "true" | "false";
}

export const defaultProps = {
  className: "",
  style: undefined,
  name: "",
  width: "",
  height: "",
  size: "",
  svg64: "",
  svgSrc: "",
  onClick: () => undefined,
} as SVG_IconProps;

const IconSkyline: FunctionComponent<SVG_IconProps> = (props: SVG_IconProps) => {
  const classPrefix = globalConfig.classPrefix;
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
    fallback = !globalConfig.useSvg,
  } = { ...defaultProps, ...props };

  const handleClick: React.MouseEventHandler = (e) => {
    onClick && onClick(e);
  };

  const pxCheck = (value: string | number): string => {
    if (value === "") return "";
    return isNaN(Number(value)) ? String(value) : value + "px";
  };

  const classes = () => {
    const iconName = fallback ? name?.toLowerCase() : name;
    return `${
      fallback ? globalConfig.fontClassName : ""
    } ${classPrefix} ${classPrefix}-${iconName} ${className || ""}`.trim();
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
      ...(color ? { color } : {}),
    };
  };

  const ariaProps = {
    role: ariaRole,
    "aria-label": ariaLabel,
    "aria-roledescription": ariaRoledescription,
    "aria-hidden": ariaHidden,
    "aria-checked": ariaChecked,
    "aria-selected": ariaSelected,
  };

  if (fallback) {
    const tag = globalConfig.tag === "i" ? "view" : (globalConfig.tag || "view");
    return React.createElement<any>(
      tag,
      {
        className: classes(),
        style: getStyle(),
        onClick: handleClick,
        ...ariaProps,
      },
      children
    );
  }

  return React.createElement<any>(
    Image,
    {
      src: svgSrc || svg64,
      className: classes(),
      style: getStyle(),
      onClick: handleClick,
      mode: "aspectFit",
      svg: true,
      ...ariaProps,
    },
    children
  );
};

export default IconSkyline;
