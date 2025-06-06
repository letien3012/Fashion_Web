import axios from "axios";

const backendUrl = "http://localhost:3005";

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["Accept"] = "application/json";

const AdminAuthService = {
  backendUrl,

  async login(email, password) {
    try {
      const response = await axios.post(
        `${backendUrl}/api/employees/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.success && response.data.token) {
        // Store token and employee info
        localStorage.setItem("token-admin", response.data.token);
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
    localStorage.removeItem("token-admin");
    localStorage.removeItem("employee");
    localStorage.removeItem("isAdmin");
    delete axios.defaults.headers.common["Authorization"];
  },

  isAuthenticated() {
    return (
      !!localStorage.getItem("token-admin") &&
      localStorage.getItem("isAdmin") === "true"
    );
  },

  getToken() {
    return localStorage.getItem("token-admin");
  },

  getEmployee() {
    const employee = localStorage.getItem("employee");
    return employee ? JSON.parse(employee) : null;
  },
};

export default AdminAuthService;
