import axios from "axios";

const backendUrl = "http://localhost:3005";

const AdminAuthService = {
  backendUrl,

  async login(email, password) {
    try {
      const response = await axios.post(`${backendUrl}/api/employees/login`, {
        email,
        password,
      });

      if (response.data.success && response.data.token) {
        // Store token and employee info
        localStorage.setItem("token", response.data.token);
        localStorage.setItem(
          "employee",
          JSON.stringify(response.data.employee)
        );
        localStorage.setItem("isAdmin", "true");

        // Set default auth header
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.token}`;
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("employee");
    localStorage.removeItem("isAdmin");
    delete axios.defaults.headers.common["Authorization"];
  },

  isAuthenticated() {
    return (
      !!localStorage.getItem("token") &&
      localStorage.getItem("isAdmin") === "true"
    );
  },

  getToken() {
    return localStorage.getItem("token");
  },

  getEmployee() {
    const employee = localStorage.getItem("employee");
    return employee ? JSON.parse(employee) : null;
  },
};

export default AdminAuthService;
