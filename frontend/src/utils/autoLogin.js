// Auto login utility for development
export const autoLogin = async () => {
  try {
    const formData = new FormData();
    formData.append("username", "test@test.com");
    formData.append("password", "testuser123");

    const response = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.token?.access_token || data.access_token) {
      const token = data.token?.access_token || data.access_token;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(data.user || data));
      console.log("Auto login successful:", data);
      return true;
    } else {
      console.error("Auto login failed:", data);
      return false;
    }
  } catch (error) {
    console.error("Auto login error:", error);
    return false;
  }
};

// Check if user is logged in
export const isLoggedIn = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

// Logout function
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("userId");
  console.log("Logged out successfully");
}; 