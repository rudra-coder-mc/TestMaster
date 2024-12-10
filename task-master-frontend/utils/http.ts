/* eslint-disable @typescript-eslint/no-explicit-any */
import Axios, { AxiosRequestConfig, AxiosInstance } from "axios";

// Create an Axios instance with default configurations
console.log("process.env.API_URL:", process.env.API_URL);
const axiosInstance: AxiosInstance = Axios.create({
  baseURL: process.env.API_URL, // Set your base URL from environment variables
  withCredentials: true, // Automatically send cookies with requests
});

const axios = () => axiosInstance;

export type AxiosRequest<A> = Omit<AxiosRequestConfig, "params"> & {
  params?: A;
};

// Standard response type
export type ApiResponse<T> = {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
  errors?: string[];
};

// Typed HTTP Methods with ApiResponse
export const GET = async <A = any, B = any>(
  url: string,
  config?: AxiosRequest<A>,
): Promise<ApiResponse<B>> => {
  const response = await axios().get<ApiResponse<B>>(url, config);
  return response.data;
};

export const POST = async <A = any, B = any>(
  url: string,
  data?: A,
  config?: AxiosRequest<A>,
): Promise<ApiResponse<B>> => {
  const response = await axios().post<ApiResponse<B>>(url, data, config);
  return response.data;
};

export const PATCH = async <A = any, B = any>(
  url: string,
  data?: A,
  config?: AxiosRequest<A>,
): Promise<ApiResponse<B>> => {
  const response = await axios().patch<ApiResponse<B>>(url, data, config);
  return response.data;
};

export const PUT = async <A = any, B = any>(
  url: string,
  data?: A,
  config?: AxiosRequest<A>,
): Promise<ApiResponse<B>> => {
  const response = await axios().put<ApiResponse<B>>(url, data, config);
  return response.data;
};

export const DELETE = async <A = any, B = any>(
  url: string,
  config?: AxiosRequest<A>,
): Promise<ApiResponse<B>> => {
  const response = await axios().delete<ApiResponse<B>>(url, config);
  return response.data;
};

export default axios;
