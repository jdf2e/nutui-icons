<script setup lang="ts">
import { h, useAttrs, useSlots } from "vue";
const componentName = "nut-icon";
const props = defineProps({
  name: { type: String, default: "" },
  size: { type: [String, Number], default: "" },
  width: { type: [String, Number], default: "" },
  height: { type: [String, Number], default: "" },
  classPrefix: { type: String, default: "nut-icon" },
  fontClassName: { type: String, default: "nutui-iconfont" },
  color: { type: String, default: "" },
  tag: { type: String, default: "i" },
});

const slots = useSlots();

const isImage = () => {
  return props.name ? props.name.indexOf("/") !== -1 : false;
};

const pxCheck = (value: string | number): string | undefined => {
  if (value) {
    return isNaN(Number(value)) ? String(value) : value + "px";
  } else {
    return undefined;
  }
};
const _isImage = isImage();

let vnode = h(
  _isImage ? "img" : props.tag,
  {
    class: _isImage
      ? `${componentName}__img`
      : `${props.fontClassName} ${componentName} ${props.classPrefix}-${props.name}`,
    style: {
      color: props.color,
      fontSize: pxCheck(props.size),
      width: pxCheck(props.width || props.size),
      height: pxCheck(props.height || props.size),
    },
    src: _isImage ? props.name : "",
  },
  slots.default?.()
);

const render = () => {
  return vnode;
};
</script>
<template>
  <render />
</template>
