module.exports = {
  preset: "ts-jest",
  setupTestFrameworkScriptFile: "<rootDir>test/setup-test-env.ts",
  moduleFileExtensions: ["js", "jsx", "json", "ts", "tsx"],
  globals: {
    "ts-jest": {
      diagnostics: false
    }
  }
};
