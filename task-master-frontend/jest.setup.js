// jest.setup.js
import "@testing-library/jest-dom";
import "jest-environment-jsdom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock next/router
jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "",
      query: "",
      asPath: "",
      push: jest.fn(),
      replace: jest.fn(),
    };
  },
}));

jest.mock("next/link", () => {
  return jest.fn(({ children, href }) => {
    return <a href={href}>{children}</a>;
  });
});

// Mock antd message
jest.mock("antd", () => {
  const antd = jest.requireActual("antd");
  const message = {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    loading: jest.fn(),
  };
  return {
    ...antd,
    message,
  };
});

console.warn = jest.fn();
console.error = jest.fn();
// Add the console mocking
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
  console.warn.mockRestore();
});
