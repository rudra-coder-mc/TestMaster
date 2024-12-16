import { AxiosRequestConfig } from "axios";

const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

beforeAll(() => {
  jest.doMock("axios", () => ({
    create: () => mockAxiosInstance,
  }));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("HTTP Utilities", () => {
  let GET: (url: string, config?: AxiosRequestConfig) => Promise<unknown>;
  let POST: (
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ) => Promise<unknown>;
  let PUT: (
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ) => Promise<unknown>;
  let DELETE: (url: string, config?: AxiosRequestConfig) => Promise<unknown>;

  beforeEach(async () => {
    const http = await import("@/utils/http");
    GET = http.GET;
    POST = http.POST;
    PUT = http.PUT;
    DELETE = http.DELETE;
  });

  const mockSuccessResponse = {
    data: {
      message: "Success",
      data: { success: true },
    },
  };

  const mockRegularResponse = {
    data: { success: true },
  };

  describe("GET", () => {
    it("makes successful GET request and returns data when message is Success", async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockSuccessResponse);

      const result = await GET("/test");

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/test", undefined);
      expect(result).toEqual({ success: true });
    });

    it("handles GET request error", async () => {
      const error = new Error("Network error");
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      await expect(GET("/test")).rejects.toThrow("Network error");
    });
  });

  describe("POST", () => {
    it("makes successful POST request and returns data when message is Success", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(mockSuccessResponse);
      const data = { name: "test" };

      const result = await POST("/test", data);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "/test",
        data,
        undefined
      );
      expect(result).toEqual({ success: true });
    });

    it("handles POST request error", async () => {
      const error = new Error("Network error");
      mockAxiosInstance.post.mockRejectedValueOnce(error);
      const data = { name: "test" };

      await expect(POST("/test", data)).rejects.toThrow("Network error");
    });
  });

  describe("PUT", () => {
    it("makes successful PUT request and returns entire response data", async () => {
      mockAxiosInstance.put.mockResolvedValueOnce(mockRegularResponse);
      const data = { name: "test" };

      const result = await PUT("/test", data);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        "/test",
        data,
        undefined
      );
      expect(result).toEqual({ success: true });
    });

    it("handles PUT request error", async () => {
      const error = new Error("Network error");
      mockAxiosInstance.put.mockRejectedValueOnce(error);
      const data = { name: "test" };

      await expect(PUT("/test", data)).rejects.toThrow("Network error");
    });
  });

  describe("DELETE", () => {
    it("makes successful DELETE request and returns entire response data", async () => {
      mockAxiosInstance.delete.mockResolvedValueOnce(mockRegularResponse);

      const result = await DELETE("/test");

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith("/test", undefined);
      expect(result).toEqual({ success: true });
    });

    it("handles DELETE request error", async () => {
      const error = new Error("Network error");
      mockAxiosInstance.delete.mockRejectedValueOnce(error);

      await expect(DELETE("/test")).rejects.toThrow("Network error");
    });
  });
});
