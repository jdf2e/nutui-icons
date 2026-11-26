import React, { FunctionComponent } from "react";
import { globalConfig, defaultProps, SVG_IconProps } from "./internal";

export { defaultProps };
export type { SVG_IconProps };

declare const getCurrentPages: any;

// 检查当前是否运行在微信小程序 Skyline 引擎下
export const isSkyline = (): boolean => {
  if (typeof globalConfig.isSkyline === "boolean") {
    return globalConfig.isSkyline;
  }
  if (typeof globalConfig.skyline === "boolean") {
    return globalConfig.skyline;
  }
  if (typeof process !== "undefined" && process.env.TARO_ENV === "skyline") {
    return true;
  }
  if (typeof process !== "undefined" && process.env.TARO_ENV && process.env.TARO_ENV !== "weapp") {
    return false;
  }
  try {
    if (typeof getCurrentPages === "function") {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (currentPage && (currentPage as any).renderer === "skyline") {
        return true;
      }
    }
  } catch (e) {
    // ignore
  }
  return false;
};

const B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const B64_PREFIX = "data:image/svg+xml;base64,";
const MAX_TINT_CACHE_SIZE = 500;
const tintCache = new Map<string, string>();

const decodeBase64Ascii = (input: string): string => {
  const str = input.replace(/=+$/, "");
  let out = "";
  for (let i = 0; i < str.length; i += 4) {
    const a = B64_CHARS.indexOf(str[i]);
    const b = B64_CHARS.indexOf(str[i + 1]);
    const c = i + 2 < str.length ? B64_CHARS.indexOf(str[i + 2]) : -1;
    const d = i + 3 < str.length ? B64_CHARS.indexOf(str[i + 3]) : -1;
    out += String.fromCharCode((a << 2) | (b >> 4));
    if (c !== -1) out += String.fromCharCode(((b & 15) << 4) | (c >> 2));
    if (d !== -1) out += String.fromCharCode(((c & 3) << 6) | d);
  }
  return out;
};

const encodeBase64Ascii = (str: string): string => {
  let out = "";
  for (let i = 0; i < str.length; i += 3) {
    const a = str.charCodeAt(i);
    const hasB = i + 1 < str.length;
    const hasC = i + 2 < str.length;
    const b = hasB ? str.charCodeAt(i + 1) : 0;
    const c = hasC ? str.charCodeAt(i + 2) : 0;
    const n = (a << 16) | (b << 8) | c;
    out +=
      B64_CHARS[(n >> 18) & 63] +
      B64_CHARS[(n >> 12) & 63] +
      (hasB ? B64_CHARS[(n >> 6) & 63] : "=") +
      (hasC ? B64_CHARS[n & 63] : "=");
  }
  return out;
};

const tintSvg64 = (svg64: string, color?: string): string => {
  if (!color || !svg64.startsWith(B64_PREFIX) || color === "currentColor" || color.includes("var(")) {
    return svg64;
  }
  const cacheKey = `${color}\0${svg64}`;
  const cached = tintCache.get(cacheKey);
  if (cached) return cached;
  try {
    const raw = decodeBase64Ascii(svg64.slice(B64_PREFIX.length));
    let tinted = raw.replace(/fill="(?!none")[^"]*"/gi, `fill="${color}"`);
    if (tinted === raw) {
      tinted = raw.replace(/<svg\b/i, `<svg fill="${color}"`);
    }
    const result = B64_PREFIX + encodeBase64Ascii(tinted);
    if (tintCache.size >= MAX_TINT_CACHE_SIZE) {
      tintCache.clear();
    }
    tintCache.set(cacheKey, result);
    return result;
  } catch (e) {
    return svg64;
  }
};

const toKebabCase = (str?: string): string => {
  if (!str) return "";
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Za-z])(\d)/g, "$1-$2")
    .toLowerCase();
};

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
    const iconName = fallback ? toKebabCase(name) : name;
    return `${
      fallback ? globalConfig.fontClassName : ""
    } ${classPrefix} ${classPrefix}-${iconName} ${className || ""}`.trim();
  };

  const props2Style: any = {};
  const checkedWidth = pxCheck(width || size || "");
  const checkedHeight = pxCheck(height || size || "");
  if (checkedWidth) {
    props2Style["width"] = checkedWidth;
    if (fallback) {
      props2Style["fontSize"] = checkedWidth;
    }
  }
  if (checkedHeight) {
    props2Style["height"] = checkedHeight;
  }

  const ariaProps = {
    role: ariaRole,
    "aria-label": ariaLabel,
    "aria-roledescription": ariaRoledescription,
    "aria-hidden": ariaHidden,
    "aria-checked": ariaChecked,
    "aria-selected": ariaSelected,
  };

  if (fallback) {
    const tag = globalConfig.tag === "i" ? "text" : (globalConfig.tag || "text");
    return React.createElement<any>(
      tag,
      {
        className: classes(),
        style: {
          ...style,
          ...props2Style,
          ...(color ? { color } : {}),
        },
        onClick: handleClick,
        ...ariaProps,
      },
      children
    );
  }

  const targetColor =
    color || (typeof style?.color === "string" ? style.color : "") || "#171A26";
  const iconUrl = svg64 ? tintSvg64(svg64, targetColor) : svgSrc;
  const bgStyle: any = {
    backgroundImage: `url('${iconUrl}')`,
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  };

  const tag = globalConfig.tag === "i" ? "view" : (globalConfig.tag || "view");
  return React.createElement<any>(
    tag,
    {
      className: classes(),
      style: {
        ...style,
        ...bgStyle,
        ...props2Style,
      },
      onClick: handleClick,
      ...ariaProps,
    },
    children
  );
};

export default IconSkyline;
