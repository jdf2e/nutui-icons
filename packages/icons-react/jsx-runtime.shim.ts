// UMD 构建专用垫片：由 vite.config.build.umd.ts 中的 alias 引入，并随库一起打包
// 不直接使用 react/jsx-runtime 的原因：
// 1. 它会读取 React 的内部字段，React 19 下已没有该字段，加载即抛错
// 2. 浏览器 <script> 方式下，React 不会在 window 上提供它对应的全局变量
// 这里只调用 react 的公开 API createElement，元素始终由宿主应用自己的 React 创建
import React from 'react'

function createElement(type: React.ElementType, props: any, key: React.Key | undefined, isStaticChildren: boolean) {
    const { children, ...rest } = props || {}
    const finalProps = key === undefined ? rest : { ...rest, key }
    if (children === undefined) {
        return React.createElement(type, finalProps)
    }
    if (isStaticChildren && Array.isArray(children)) {
        return React.createElement(type, finalProps, ...children)
    }
    return React.createElement(type, finalProps, children)
}

export const Fragment = React.Fragment

export function jsx(type: React.ElementType, props: any, key?: React.Key) {
    return createElement(type, props, key, false)
}

export function jsxs(type: React.ElementType, props: any, key?: React.Key) {
    return createElement(type, props, key, true)
}

// 开发模式构建（vite build --mode development）会引用 react/jsx-dev-runtime 的 jsxDEV
export function jsxDEV(type: React.ElementType, props: any, key?: React.Key, isStaticChildren?: boolean) {
    return createElement(type, props, key, Boolean(isStaticChildren))
}
