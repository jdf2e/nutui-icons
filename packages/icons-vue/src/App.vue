<script setup lang="ts">
import IconFont from "./IconFont.vue";
import Voice from "./components/Voice.vue";
import icons from "@iconfont/config.json";
const copyTag = (name: string) => {
  const text = `<IconFont name="${name}" />`;
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
const onClick = () => {
  console.log("7777");
};
</script>

<template>
  <Voice
    @click="onClick"
    width="100"
    height="100"
    name="loading"
    color="blue"
  />

  <h2>基本用法</h2>
  <IconFont name="dongdong" />
  <IconFont name="JD" />
  <h2>图片链接</h2>
  <IconFont
    size="40"
    name="https://img11.360buyimg.com/imagetools/jfs/t1/137646/13/7132/1648/5f4c748bE43da8ddd/a3f06d51dcae7b60.png"
  >
  </IconFont>
  <h2>图标颜色</h2>
  <IconFont name="dongdong" color="#fa2c19" />
  <IconFont name="dongdong" color="#64b578" />
  <IconFont name="JD" color="#fa2c19" />

  <h2>图标大小</h2>
  <IconFont name="dongdong" />
  <IconFont name="dongdong" size="24" />
  <IconFont name="dongdong" size="26" />

  <nut-cell-group
    v-for="item in icons.data"
    :title="item.name"
    :key="item.nameEn"
  >
    <h2>{{ item.name }}</h2>
    <nut-cell>
      <ul>
        <li v-for="_item in item.icons" :key="_item">
          <IconFont :name="_item" @click="copyTag(_item)" />
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
    <h2>{{ item.name }}</h2>
    <nut-cell>
      <ul>
        <li v-for="it in item.icons" :key="it.name">
          <IconFont
            :name="it.name"
            :class="`nut-icon-${it['animation-name']} nut-icon-${it['animation-time']}`"
            @click="copyTag(it['animation-name'])"
          >
          </IconFont>
          <span>{{ it["animation-name"] }}</span>
        </li>
      </ul>
    </nut-cell>
  </nut-cell-group>
</template>

<style lang="scss">
@import "./style_iconfont.scss";
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
