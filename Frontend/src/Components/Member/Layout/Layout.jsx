import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({
  children,
  cartItems,
  bookmarks,
  categories,
  orders,
  setShowCart,
  setShowBookmarks,
  setShowOrders,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        categoryMenuOpen={categoryMenuOpen}
        setCategoryMenuOpen={setCategoryMenuOpen}
        categories={categories}
        cartItems={cartItems}
        bookmarks={bookmarks}
        orders={orders}
        setShowCart={setShowCart}
        setShowBookmarks={setShowBookmarks}
        setShowOrders={setShowOrders}
      />
      <main>{children}</main>
      <Footer />
    </div>
  );
}