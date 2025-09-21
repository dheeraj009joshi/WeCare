// Auto login utility for development
export const autoLogin = async () => {
  try {
    const response = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@test.com",
        password: "test123"
      }),
    });

    const data = await response.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      console.log("Auto login successful:", data.user);
      return true;
    } else {
      console.error("Auto login failed:", data.message);
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