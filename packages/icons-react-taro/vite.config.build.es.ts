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
  IconSkylineTemplate: `./src/IconSkylineTemplate.tsx`,
  IconHarmonyTemplate: `./src/IconHarmonyTemplate.tsx`,
  IconTemplate: `./src/IconTemplate.tsx`,
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
        const iconsDir = join(__dirname, "dist/es/icons");
        if (fs.existsSync(iconsDir)) {
          const files = fs.readdirSync(iconsDir);
          for (const file of files) {
            if (file.endsWith(".js")) {
              const filePath = join(iconsDir, file);
              const content = fs.readFileSync(filePath).toString();
              if (content.includes("(void 0).TARO_ENV")) {
                fs.writeFileSync(
                  filePath,
                  content.replace(/\(void 0\)\.TARO_ENV/g, "process.env.TARO_ENV")
                );
              }
            }
          }
        }
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
