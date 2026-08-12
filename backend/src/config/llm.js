import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

export const isNvidia = !!(process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY !== 'placeholder_key');
export const isOpenAI = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'placeholder_key');

const apiKey = isNvidia ? process.env.NVIDIA_API_KEY : (process.env.OPENAI_API_KEY || 'placeholder_key');
const baseURL = isNvidia ? 'https://integrate.api.nvidia.com/v1' : undefined;

export const defaultModelName = isNvidia 
  ? (process.env.NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct') 
  : (process.env.OPENAI_MODEL || 'gpt-4o');

export const openai = new OpenAI({ apiKey, baseURL });
