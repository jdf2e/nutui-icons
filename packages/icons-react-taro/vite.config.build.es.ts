import { defineConfig } from "vite";
import { dirname, resolve, join } from "path";
import react from "@vitejs/plugin-react";
import { iconsConfig } from "./src/components/iconsConfig";
import * as fs from "fs";

let input = {
  IconFont: `./src/IconFont.tsx`,
  IconTemplate: `./src/IconTemplate.tsx`,
  IconHarmonyTemplate: `./src/IconHarmonyTemplate.tsx`,
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
    react(),
    {
      name: "revert Process.env",
      apply: "build",
      async closeBundle() {
        const iconsDir = join(__dirname, "dist/es/icons");
        if (fs.existsSync(iconsDir)) {
          for (const file of fs.readdirSync(iconsDir)) {
            if (!file.endsWith(".js")) continue;
            const esFile = join(iconsDir, file);
            const fileContent = fs.readFileSync(esFile, "utf8");
            if (fileContent.includes("(void 0).TARO_ENV")) {
              fs.writeFileSync(
                esFile,
                fileContent.replace(/\(void 0\)\.TARO_ENV/g, "process.env.TARO_ENV"),
              );
            }
          }
          console.log("File rewritten successfully!");
        }
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
        "react/jsx-runtime",
        "classnames",
        "./internal",
        "./IconTemplate",
        "../IconTemplate",
        "./IconHarmonyTemplate",
        "../IconHarmonyTemplate",
        "./configure",
        "@tarojs/components",
      ],
      output: {
        paths: (id) => {
          if (/internal/.test(id)) return `./internal.js`;
          if (/IconHarmonyTemplate/.test(id)) return `./IconHarmonyTemplate.js`;
          if (/IconTemplate/.test(id)) return `./IconTemplate.js`;
          return id;
        },
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        dir: resolve(__dirname, "./dist/es/icons"),
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
