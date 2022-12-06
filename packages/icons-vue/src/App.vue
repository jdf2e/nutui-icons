<script setup lang="ts">
import Icon from "./Icon.vue";
import icons from "./iconfont/config.json";
const copyTag = (name: string) => {
  const text = `<Icon name="${name}" />`;
  const displayText = `&lt;nut-icon name="${name}"&gt;&lt;/nut-icon&gt;`;
  const input = document.createElement("input");
  document.body.appendChild(input);
  input.setAttribute("value", text);
  input.select();
  if (document.execCommand("copy")) {
    document.execCommand("copy");
    console.info(`复制成功: <br/>${displayText}`);
  }
  document.body.removeChild(input);
};
</script>

<template>
  <Icon name="dongdong" />

  <h2>基本用法</h2>
  <nut-cell>
    <Icon name="dongdong" />
    <Icon name="JD" />
  </nut-cell>
  <h2>图片链接</h2>
  <nut-cell>
    <Icon
      size="40"
      name="https://img11.360buyimg.com/imagetools/jfs/t1/137646/13/7132/1648/5f4c748bE43da8ddd/a3f06d51dcae7b60.png"
    >
    </Icon>
  </nut-cell>
  <h2>图标颜色</h2>
  <nut-cell>
    <Icon name="dongdong" color="#fa2c19" />
    <Icon name="dongdong" color="#64b578" />
    <Icon name="JD" color="#fa2c19" />
  </nut-cell>

  <h2>图标大小</h2>
  <nut-cell>
    <Icon name="dongdong" />
    <Icon name="dongdong" size="24" />
    <Icon name="dongdong" size="26" />
  </nut-cell>

  <nut-cell-group
    v-for="item in icons.data"
    :title="item.name"
    :key="item.nameEn"
  >
    <nut-cell>
      <ul>
        <li v-for="_item in item.icons" :key="_item">
          <Icon :name="_item" @click="copyTag(_item)" />
          <span>{{ _item }}</span>
        </li>
      </ul>
    </nut-cell>
  </nut-cell-group>
  <nut-cell-group
    v-for="item in icons.style"
    :title="item.name"
    :key="item.nameEn"
  >
    <nut-cell>
      <ul>
        <li v-for="it in item.icons" :key="it.name">
          <Icon
            :name="it.name"
            :class="`nut-icon-${it['animation-name']} nut-icon-${it['animation-time']}`"
            @click="copyTag(it['animation-name'])"
          >
          </Icon>
          <span>{{ it["animation-name"] }}</span>
        </li>
      </ul>
    </nut-cell>
  </nut-cell-group>
</template>

<style scoped lang="scss">
.nut-cell {
  > .nutui-iconfont {
    margin-right: 10px;
  }
}
ul {
  display: flex;
  flex-wrap: wrap;
  padding: 0;
  width: 100%;
  li {
    flex: 0 0 25%;
    max-width: 25%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    span {
      height: 40px;
      font-size: 12px;
      text-align: center;
    }
    .nutui-iconfont {
      margin: 16px 0 16px;
    }
  }
}
</style>
