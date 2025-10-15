module.exports = (api) => {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: {
            "@": "./src",
            "@/components": "./src/components",
            "@/screens": "./src/screens",
            "@/utils": "./src/utils",
            "@/services": "./src/services",
            "@/store": "./src/store",
            "@/hooks": "./src/hooks",
            "@/types": "./src/types",
            "@/assets": "./src/assets",
            "@/mock": "./src/mock",
            "@/navigation": "./src/navigation",
            "@/providers": "./src/providers",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
