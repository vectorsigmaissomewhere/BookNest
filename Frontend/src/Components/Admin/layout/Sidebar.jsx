import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingCart,
  Users,
  Tag,
  PlusCircle,
} from "lucide-react";
import axios from "axios";

const sidebarLinks = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { title: "Books", icon: BookOpen, href: "/admin/books" },
  { title: "Add Book", icon: PlusCircle, href: "/admin/books/create" },
  { title: "Add Author", icon: PlusCircle, href: "/admin/authors/create" },
  { title: "Add Genre", icon: PlusCircle, href: "/admin/genres/create" },
  { title: "Users", icon: Users, href: "/admin/users" },
  { title: "Orders", icon: ShoppingCart, href: "/admin/orders" },
  { title: "Settings", icon: Settings, href: "/admin/settings" },
  {
    title: "Add Announcement",
    icon: PlusCircle,
    href: "/admin/announcements/create",
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5098/api/Auth/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
    <div
      className={`h-screen bg-blue-900 text-white transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
        <h1 className={`font-bold text-xl ${collapsed && "hidden"}`}>
          BookNest
        </h1>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-gray-800"
        >
          <ChevronDown
            className={`h-5 w-5 transition-transform ${
              collapsed ? "rotate-90" : "-rotate-90"
            }`}
          />
        </button>
      </div>

      <nav className="mt-6 px-2">
        <ul className="space-y-2">
          {sidebarLinks.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  location.pathname === link.href
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <link.icon className="h-5 w-5 mr-3" />
                {!collapsed && <span>{link.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-0 p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full text-gray-400 hover:text-white transition-colors ${
            collapsed ? "justify-center" : "px-4"
          }`}
        >
          <LogOut className="h-5 w-5 mr-3" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
