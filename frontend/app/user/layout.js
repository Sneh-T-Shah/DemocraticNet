"use client";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import AppContext from "../../context/AppContext";
const layout = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { setUser } = useContext(AppContext);

  const router = useRouter();

  const fetchUser = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/me", {
        headers: {
          contentType: "application/json",
          authToken: token,
        },
      });

      if (response.status != 200) {
        console.error("Failed to fetch user data");
        router.push("/login");
      }

      const data = await response.json();
      setUser(data);

      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch user data");
      router.push("/login");
    }
  };

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      console.error("User is not authenticated");
      router.push("/login");
    }
    fetchUser(authToken);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="font-semibold text-3xl animate-pulse">Loading...</p>
      </div>
    );
  }

  return children;
};

export default layout;
