import { useState, useEffect } from "react";
import axios from "axios";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import Layout from "./Layout/Layout";

export default function NewArrivals() {
  const [cartItems, setCartItems] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [books, setBooks] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(10);

  // API Base URL
  const API_BASE = "http://localhost:5098";

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const params = {
          pageNumber: currentPage,
          pageSize: booksPerPage,
          sortBy: "date",
          sortOrder: "desc",
        };

        const [booksRes, genresRes, cartRes, bookmarksRes] = await Promise.all([
          axios.get(`${API_BASE}/api/books`, { params }),
          axios.get(`${API_BASE}/api/admin/genres`),
          axios.get(`${API_BASE}/api/cart`, { headers }),
          axios.get(`${API_BASE}/api/bookmarks`, { headers }),
        ]);

        setBooks(booksRes.data.items);
        setTotalItems(booksRes.data.totalItems);
        setCategories(genresRes.data.map((g) => g.name));
        setCartItems(cartRes.data);
        setBookmarks(bookmarksRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentPage]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-lg">Loading…</span>
      </div>
    );
  }

  // Pagination logic
  const totalPages = Math.ceil(totalItems / booksPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Handler for adding to cart
  const handleAddToCart = async (bookId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to add items to cart.");
        return;
      }
      await axios.post(
        `${API_BASE}/api/cart`,
        { bookId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const cartRes = await axios.get(`${API_BASE}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(cartRes.data);
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert(err.response?.data?.error || "Failed to add to cart.");
    }
  };

  // Handler for toggling bookmark
  const handleToggleBookmark = async (bookId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to manage bookmarks.");
        return;
      }
      const isBookmarked = bookmarks.some((item) => item.bookId === bookId);
      if (isBookmarked) {
        await axios.delete(`${API_BASE}/api/bookmarks/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(
          `${API_BASE}/api/bookmarks`,
          { bookId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      const bookmarksRes = await axios.get(`${API_BASE}/api/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookmarks(bookmarksRes.data);
    } catch (err) {
      console.error("Error toggling bookmark:", err);
      alert(err.response?.data?.error || "Failed to toggle bookmark.");
    }
  };

  // Function to check if a book is bookmarked
  const isBookmarked = (bookId) =>
    bookmarks.some((item) => item.bookId === bookId);

  // Calculate discounted price
  const calculateDiscountedPrice = (price, discount) =>
    (price * (1 - discount / 100)).toFixed(2);

  // Format date to display nicely
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Layout
  cartItems={cartItems}
  bookmarks={bookmarks}
  categories={categories}
  setShowCart={setShowCart}
  setShowBookmarks={setShowBookmarks}
>
  {/* Page Header */}
  <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-12">
    <div className="container mx-auto px-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">New Arrivals</h1>
      <p className="text-lg opacity-90">
        Discover our latest additions to the BookNest collection
      </p>
    </div>
  </div>

  {/* New Arrivals Content */}
  <section className="py-12 bg-gray-50">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Latest Books</h2>
          <p className="text-gray-600">
            Fresh off the press and ready for your bookshelf
          </p>
        </div>

        <div className="mt-4 md:mt-0">
          <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="newest">Sort by: Newest First</option>
            <option value="bestselling">Sort by: Bestselling</option>
            <option value="price-low">Sort by: Price (Low to High)</option>
            <option value="price-high">Sort by: Price (High to Low)</option>
          </select>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">
            No new arrivals found
          </h3>
          <p className="text-gray-600 mb-4">
            Check back later for the latest books!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {books.map((book) => (
            <div
              key={book.bookId}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative"
            >
              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                NEW
              </div>
              <div className="relative">
                <img
                  src={`${API_BASE}${book.imageUrl}`}
                  alt={book.title}
                  className="w-full h-64 object-cover"
                />
                {book.discount > 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {book.discount}% OFF
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-800">{book.title}</h3>
                <p className="text-gray-600 mb-1">
                  {book.authors?.[0] || "Unknown Author"}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  Added on {formatDate(book.publicationDate)}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {book.discount > 0 ? (
                      <>
                        <span className="text-red-500 font-bold">
                          ${calculateDiscountedPrice(book.price, book.discount)}
                        </span>
                        <span className="text-gray-500 line-through text-sm ml-2">
                          ${book.price}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold">${book.price}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleBookmark(book.bookId)}
                    className={`p-1 ${isBookmarked(book.bookId) ? "text-red-500" : "text-gray-500"} hover:text-red-500`}
                  >
                    <Heart
                      size={18}
                      fill={isBookmarked(book.bookId) ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                <button
                  onClick={() => handleAddToCart(book.bookId)}
                  className="w-full mt-3 bg-blue-700 text-white py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {books.length > 0 && (
        <>
          <div className="flex justify-center items-center mt-10 space-x-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"
              }`}
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center space-x-1">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`w-8 h-8 rounded-md ${
                    currentPage === index + 1
                      ? "bg-blue-700 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              Showing {(currentPage - 1) * booksPerPage + 1}-
              {Math.min(currentPage * booksPerPage, totalItems)} of {totalItems}{" "}
              books
            </p>
          </div>
        </>
      )}
    </div>
  </section>
</Layout>
  );
}
