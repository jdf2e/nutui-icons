<script setup lang="ts">
import { computed, CSSProperties } from "vue";
const props = defineProps({
  class: { type: String, default: "" },
  name: { type: String, default: "" },
  color: { type: String, default: "" },
  width: { type: [String, Number], default: "" },
  height: { type: [String, Number], default: "" },
});

const emit = defineEmits<{
  (e: "click", event: Event): void;
}>();

const onClick = (event: Event) => {
  emit("click", event);
};
const pxCheck = (value: string | number): string | undefined => {
  if (value) {
    return isNaN(Number(value)) ? String(value) : value + "px";
  } else {
    return undefined;
  }
};
const classes = computed(() => {
  const prefixCls = "nut-icon";
  return {
    [props.class]: props.class,
    [prefixCls]: true,
    [prefixCls + "-" + props.name]: props.name,
  };
});

const getStyle = computed(() => {
  const style: CSSProperties = {};

  style.height = pxCheck(props.height);
  style.width = pxCheck(props.width);

  return style;
});
</script>
<template>
  <svg
    :class="classes"
    :style="getStyle"
    @click="onClick"
    xmlns="http://www.w3.org/2000/svg"
    :color="color"
    viewBox="${viewBox}"
    :aria-labelledby="name"
    role="presentation"
  >
    <path
      d="M7.49988 3.91436L3.85359 7.56065L3.14648 6.85354L7.78777 2.21226C7.90493 2.0951 8.09488 2.0951 8.21204 2.21226L12.8533 6.85354L12.1462 7.56065L8.49988 3.91432L8.49971 14L7.49971 14L7.49988 3.91436Z"
      fill="currentColor"
      fill-opacity="0.9"
    ></path>
  </svg>
</template>
