import axios from "axios";

const API_URL = "http://localhost:3005/api/auth";
const USER_KEY = "user";

const authService = {
  async login(email, password) {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });
      if (response.data.token) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout() {
    localStorage.removeItem(USER_KEY);
  },

  register(userData) {
    return axios.post(`${API_URL}/register`, userData);
  },

  getCurrentUser() {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    return JSON.parse(userStr);
  },

  isAuthenticated() {
    return !!this.getCurrentUser();
  },
};

export default authService;
