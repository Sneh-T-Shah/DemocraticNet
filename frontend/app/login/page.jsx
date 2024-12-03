"use client";
import React, { use, useState } from "react";
import { motion } from "framer-motion";
import { Card, Input, Button, Link, Image } from "@nextui-org/react";
import { EyeIcon, EyeOffIcon, MailIcon, LockIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Login attempt with:", { email, password });
    const payload = { email, password };
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.status != 200) {
        throw new Error("Failed to login");
      }

      const data = await response.json();
      const { authToken } = data;
      localStorage.setItem("authToken", authToken);

      router.push("/user");
    } catch (error) {
      console.error("Failed to login", error);
      return;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-full">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-8 w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <Image
              src="https://st2.depositphotos.com/6789684/12262/v/450/depositphotos_122620866-stock-illustration-illustration-of-flat-icon.jpg" // Replace with your app's logo
              alt="App Logo"
              width={80}
              height={80}
              className="mb-4"
            />
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-sm text-gray-500">
              Sign in to access your account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startContent={<MailIcon className="text-default-400" size={20} />}
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startContent={<LockIcon className="text-default-400" size={20} />}
              endContent={
                <button type="button" onClick={toggleVisibility}>
                  {isVisible ? (
                    <EyeIcon className="text-default-400" size={20} />
                  ) : (
                    <EyeOffIcon className="text-default-400" size={20} />
                  )}
                </button>
              }
              type={isVisible ? "text" : "password"}
            />
            <div className="flex justify-between items-center">
              <Link href="#" size="sm">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" color="primary" className="w-full">
              Sign In
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
