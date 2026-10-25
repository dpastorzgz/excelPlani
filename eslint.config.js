import eslint from "@eslint/js";

const browserGlobals = {
  Blob: "readonly",
  ClipboardItem: "readonly",
  document: "readonly",
  fetch: "readonly",
  FileReader: "readonly",
  Event: "readonly",
  getComputedStyle: "readonly",
  HTMLDialogElement: "readonly",
  Image: "readonly",
  navigator: "readonly",
  URL: "readonly",
  window: "readonly",
};

const nodeGlobals = {
  Blob: "readonly",
  Buffer: "readonly",
  clearInterval: "readonly",
  console: "readonly",
  process: "readonly",
  Response: "readonly",
  setInterval: "readonly",
  setTimeout: "readonly",
  URL: "readonly",
};

export default [
  {
    ignores: [
      "archive/**",
      "coverage/**",
      "dist/**",
      "force-app/**",
      "framework/**",
      "node_modules/**",
      "technology-rules/**",
      "vendor/**",
      "dashboard-assets/vendor/**",
      "work-item/**",
    ],
  },
  eslint.configs.recommended,
  {
    files: ["dashboard-config.js", "dashboard-assets/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: browserGlobals,
    },
    rules: {
      "no-eval": "error",
      "no-implied-eval": "error"
    },
  },
  {
    files: ["*.config.js", "start-dashboard.mjs", "scripts/**/*.mjs", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: nodeGlobals,
    },
  },
  {
    files: ["tests/e2e/**/*.js"],
    languageOptions: {
      globals: { ...nodeGlobals, ...browserGlobals },
    },
  },
  {
    files: ["tests/integration/**/*.js"],
    languageOptions: {
      globals: { ...nodeGlobals, ...browserGlobals },
    },
  },
];
