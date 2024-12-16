/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig } from "axios";

// Create axios instance with default config
const axiosInstance = axios.create({
  // Add any default configurations here if needed
  baseURL: process.env.API_URL,
  withCredentials: true,
  timeout: 10000,
});

export const GET = async (url: string, config?: AxiosRequestConfig) => {
  try {
    const response = await axiosInstance.get(url, config);
    if (response.data.message == "Success") return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const POST = async (
  url: string,
  data?: any,
  config?: AxiosRequestConfig
) => {
  try {
    const response = await axiosInstance.post(url, data, config);
    if (response.data.message == "Success") return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const PUT = async (
  url: string,
  data?: any,
  config?: AxiosRequestConfig
) => {
  try {
    const response = await axiosInstance.put(url, data, config);
    if (response.data.message == "Success") return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const DELETE = async (url: string, config?: AxiosRequestConfig) => {
  try {
    const response = await axiosInstance.delete(url, config);
    if (response.data.message == "Success") return response.data.data;
  } catch (error) {
    throw error;
  }
};
