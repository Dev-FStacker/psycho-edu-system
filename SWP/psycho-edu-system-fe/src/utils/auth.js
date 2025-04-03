export const getAuthDataFromLocalStorage = () => {
  const userData = localStorage.getItem("user");
  if (!userData) return null;

  try {
    const parsedData = JSON.parse(userData);
    const tokenPayload = JSON.parse(atob(parsedData.accessToken.split(".")[1]));

    return {
      accessToken: parsedData.accessToken,
      role: parsedData.role,
      userId: tokenPayload.userId,
      email: tokenPayload.email,
      username: tokenPayload.username,
    };
  } catch (error) {
    console.error("Error parsing auth data:", error);
    return null;
  }
};
