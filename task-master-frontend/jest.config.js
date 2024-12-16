// jest.config.js
const nextJest = require("next/jest.js");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    "^antd/es/(.*)$": "antd/lib/$1",
    "^@ant-design/icons/es/(.*)$": "@ant-design/icons/lib/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
  transformIgnorePatterns: [
    "/node_modules/(?!antd|@ant-design|rc-*|@rc-component)/",
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx|mjs)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  moduleDirectories: ["node_modules", "<rootDir>"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node", "mjs"],
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  extensionsToTreatAsEsm: [".ts", ".tsx", ".jsx"],
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.json",
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
