<script setup lang="ts">
const props = defineProps({
  name: { type: String, default: "" },
  color: { type: String, default: "" },
  width: { type: [String, Number], default: "16" },
  height: { type: [String, Number], default: "16" },
});

const emit = defineEmits<{
  (e: "click", event: Event): void;
}>();

const onClick = (event: Event) => {
  emit("click", event);
};
</script>
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    :color="color"
    viewBox="viewBox"
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
