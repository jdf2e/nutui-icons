import { defineConfig } from "vite";
import { dirname, resolve, join } from "path";
import react from "@vitejs/plugin-react";
import { iconsConfig } from "./src/components/iconsConfig";
import * as fs from "fs";

let input = {
  IconFont: `./src/IconFont.tsx`,
  configure: `./src/configure.ts`,
  internal: `./src/internal.ts`,
  IconFontConfig: `./src/buildEntry/iconFontConfig.ts`,
  SvgConfig: `./src/buildEntry/svgConfig.ts`,
} as any;

iconsConfig.map((name) => {
  input[name] = `./src/components/${name}.tsx`;
});

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: false,
  plugins: [
    react({ jsxRuntime: "classic" }),
    {
      name: "revert Process.env",
      apply: "build",
      async closeBundle() {
        const esFile = join(__dirname, "dist/es/icons/IconHarmonyTemplate.js");
        const fileContent = fs
          .readFileSync(esFile)
          .toString()
          .replace(
            `(void 0).TARO_ENV === "h5"`,
            `process.env.TARO_ENV === "h5"`
          );
        fs.writeFileSync(esFile, fileContent);
        console.log("File rewritten successfully!");
      },
    },
  ],
  build: {
    minify: false,
    lib: {
      entry: input,
      formats: ["es"],
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: [
        "react",
        "react-dom",
        "classnames",
        "./internal",
        "./configure",
        "@tarojs/components",
      ],
      // input,
      output: {
        paths: (id) => {
          return /internal/.test(id) ? `./internal.js` : id;
        },
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        dir: resolve(__dirname, "./dist/es/icons"),
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
