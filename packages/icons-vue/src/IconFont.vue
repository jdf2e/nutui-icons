<script setup lang="ts">
import { h, useAttrs, useSlots } from "vue";
const componentName = "nut-icon";
const props = defineProps({
  name: { type: String, default: "" },
  fontSize: { type: [String, Number], default: "12" },
  width: { type: [String, Number], default: "" },
  height: { type: [String, Number], default: "" },
  classPrefix: { type: String, default: "nut-icon" },
  fontClassName: { type: String, default: "nutui-iconfont" },
  color: { type: String, default: "" },
  tag: { type: String, default: "i" },
});

const emit = defineEmits<{
  (e: "click", event: Event): void;
}>();

const onClick = (event: Event) => {
  emit("click", event);
};

const slots = useSlots();
const attrs = useAttrs();

const isImage = () => {
  return props.name ? props.name.indexOf("/") !== -1 : false;
};

const pxCheck = (value: string | number): string => {
  return isNaN(Number(value)) ? String(value) : `${value}px`;
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
      fontSize: pxCheck(props.fontSize),
      width: pxCheck(props.width),
      height: pxCheck(props.height),
    },
    onClick,
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
