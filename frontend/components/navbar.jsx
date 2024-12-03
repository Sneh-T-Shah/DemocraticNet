"use client";
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  User,
} from "@nextui-org/react";
import { Kbd } from "@nextui-org/kbd";
import { Link } from "@nextui-org/link";
import { Input } from "@nextui-org/input";
import { link as linkStyles } from "@nextui-org/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon, SearchIcon } from "@/components/icons";
import AppContext from "@/context/AppContext";
import { useContext, useEffect } from "react";
const ministryMapping = require("../ministryList.json");

export const Navbar = () => {
  const { user, setUser } = useContext(AppContext);

  const fetchUser = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/me", {
        headers: {
          contentType: "application/json",
          authToken: token,
        },
      });
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Failed to fetch user data");
    }
  };

  const handleLogout = async () => {
    setUser(null);
    localStorage.removeItem("authToken");
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <p className="font-bold text-inherit">News-Dashboard</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium"
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <Link isExternal aria-label="Github" href={siteConfig.links.github}>
            <GithubIcon className="text-default-500" />
          </Link>
          <ThemeSwitch />
          {user && (
            <Dropdown placement="bottom-start">
              <DropdownTrigger>
                <User
                  as="button"
                  avatarProps={{
                    isBordered: true,
                    src: `https://ui-avatars.com/api/?rounded=true&name=${ministryMapping[user.ministryId]}`,
                  }}
                  className="mx-2 transition-transform"
                  description={user.email}
                  name={ministryMapping[user.ministryId]}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="User Actions" variant="flat">
                <DropdownItem key="settings">
                  <Link href="/user">My Dashboard</Link>
                </DropdownItem>
                <DropdownItem
                  onPress={handleLogout}
                  key="logout"
                  color="danger"
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </NavbarItem>
      </NavbarContent>
    </NextUINavbar>
  );
};
