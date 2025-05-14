

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShoppingCart, User, Heart, Menu, X, Package } from "lucide-react";

export default function Header({
  mobileMenuOpen,
  setMobileMenuOpen,
  cartItems,
  bookmarks,
  setShowCart,
  setShowBookmarks,
  setShowOrders,
  orders,
}) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      setUser(null);
      return;
    }

    axios
      .get("http://localhost:5098/api/auth/me", {
        headers: { Authorization: `Bearer ${t}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      });
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:5098/api/auth/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (e) {
      console.warn("Logout failed:", e);
    }
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <>
  {/* Main Header */}
  <header className="bg-white shadow-md">
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        {/* Logo & Mobile Toggle */}
        <div className="flex items-center justify-between w-full lg:w-auto">
          <Link to="/" className="text-2xl font-bold text-blue-800">
            BookNest
          </Link>
          <button
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Wishlist / Cart / Orders Icons */}
        <div
          className={`${
            mobileMenuOpen ? "flex" : "hidden"
          } lg:flex items-center space-x-6`}
        >
          <button
            onClick={() => setShowBookmarks(true)}
            className="flex items-center space-x-1 text-gray-800 hover:text-blue-500 relative"
          >
            <Heart size={20} />
            <span className="text-sm">Wishlist</span>
            {bookmarks.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {bookmarks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowCart(true)}
            className="flex items-center space-x-1 text-gray-800 hover:text-blue-500 relative"
          >
            <ShoppingCart size={20} />
            <span className="text-sm">Cart</span>
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </button>

          {user && (
            <button
              onClick={() => setShowOrders(true)}
              className="flex items-center space-x-1 text-gray-800 hover:text-blue-500 relative"
            >
              <Package size={20} />
              <span className="text-sm">Orders</span>
              {orders?.filter((order) => order.status === "Pending").length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {orders.filter((order) => order.status === "Pending").length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  </header>

  {/* Navigation */}
  <nav className="bg-blue-700 text-white">
    <div className="container mx-auto px-4">
      <div
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } lg:flex items-center justify-between`}
      >
        <ul className="lg:flex">
          <li>
            <Link
              to="/userHome"
              className="block py-3 px-4 hover:bg-blue-600"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/new/arrivals"
              className="block py-3 px-4 hover:bg-blue-600"
            >
              New Arrivals
            </Link>
          </li>
          <li>
            <Link
              to="/browse/books"
              className="block py-3 px-4 hover:bg-blue-600"
            >
              Browse Books
            </Link>
          </li>
          <li>
            <Link
              to="/offers"
              className="block py-3 px-4 hover:bg-blue-600"
            >
              Offers
            </Link>
          </li>
        </ul>
        {user && (
          <div className="flex items-center space-x-4">
            <Link
              to="/userHome"
              className="flex items-center space-x-1 text-white hover:text-gray-300"
            >
              <User size={20} />
              <span className="text-sm">Account</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-100 font-medium px-4 py-2 rounded transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  </nav>
</>
  );
}