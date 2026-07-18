import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api` || "http://localhost:5000/api",
});

// Automatically inject JWT if stored in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Uploads a file directly to ImageKit using secure parameters from backend.
 * Returns the hosted file URL on success.
 */
export const uploadToImageKit = async (file: File): Promise<string> => {
  // 1. Get credentials from backend
  const authResponse = await api.get("/auth/imagekit-auth");
  const { signature, token, expire, publicKey } = authResponse.data;

  // 2. Build FormData payload
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);
  formData.append("publicKey", publicKey);
  formData.append("signature", signature);
  formData.append("token", token);
  formData.append("expire", expire.toString());

  // 3. Post to ImageKit upload API
  const uploadResponse = await axios.post(
    "https://upload.imagekit.io/api/v1/files/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return uploadResponse.data.url;
};

export default api;
