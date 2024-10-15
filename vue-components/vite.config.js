import { viteStaticCopy } from 'vite-plugin-static-copy'

export default {
  base: "./",
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: './node_modules/golden-layout/dist/css/themes',
          dest: './css'
        },
        {
          src: './node_modules/golden-layout/dist/img',
          dest: '.'
        }
      ]
    })
  ],
  build: {
    lib: {
      entry: "./src/main.js",
      name: "trame_golden_layout",
      formats: ["umd"],
      fileName: "trame_golden_layout",
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
    outDir: "../trame_golden_layout/module/serve",
    assetsDir: ".",
  },
};
