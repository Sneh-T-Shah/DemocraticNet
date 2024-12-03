"use client";
import React, { useState } from "react";
import AppContext from "./AppContext";

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // const ipAddress = "192.168.42.91";
  // const ipAddress = "192.168.0.106";
  const ipAddress = "localhost";
  // const ipAddress = "172.20.10.6";

  return (
    <AppContext.Provider
      value={{
        ipAddress,
        user,
        setUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
