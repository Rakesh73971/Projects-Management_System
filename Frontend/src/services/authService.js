import axios from "axios";

const API_URL = "http://localhost:8000";

// Create axios instance with interceptors
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ------------------- LOGIN -------------------
export const login = async ({ email, password }) => {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  try {
    const response = await axios.post(
      `${API_URL}/login/`,
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const data = response.data;
    const access_token = data.access_token || data.acess_token;
    if (!access_token) {
      throw new Error("Login response missing access token");
    }

    // Store token
    localStorage.setItem("token", access_token);

    return {
      ...data,
      access_token,
    };
  } catch (error) {
    throw error.response?.data?.detail || error.message || "Login failed";
  }
};

export const getCurrentUser = async () => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  try {
    const response = await apiClient.get(`/users/me`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || error.message || "Unable to fetch current user";
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post(
      `${API_URL}/users/`,
      userData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;

  } catch (error) {
    throw error.response?.data?.detail || "Registration failed";
  }
};


export const logout = () => {
  localStorage.removeItem("token");
};

export const getToken = () => {
  return localStorage.getItem("token");
};