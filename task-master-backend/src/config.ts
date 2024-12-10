import * as dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET;
export const MONGO_URL = process.env.MONGO_URL;
export const NODE_ENV = process.env.NODE_ENV;
export const PORT = process.env.PORT;
export const ORIGIN_URL = process.env.ORIGIN_URL;
