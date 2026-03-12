// This file handles routing API requests to the proper backend URL
// based on whether the app is running locally or in production.

// For local development, Vite proxy handles '/api' -> 'localhost:3001'
// For production, we will replace this with the Railway URL.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const apiFetch = async (endpoint: string, options?: RequestInit) => {
    const url = `${API_BASE_URL}${endpoint}`;
    return fetch(url, options);
};
