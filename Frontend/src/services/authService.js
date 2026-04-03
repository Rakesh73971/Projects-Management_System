import axios from "axios";

const API_URL = "http://localhost:8000";

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

    
    return response.data;

  } catch (error) {
  
    throw error.response?.data?.detail || "Login failed";
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