import { useState, useEffect } from "react";
import axios from "axios";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import Layout from "./Layout/Layout";

export default function Offers() {
  const [cartItems, setCartItems] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(10);

  useEffect(() => {
    async function fetchData() {
      try {
        const [booksRes, genresRes] = await Promise.all([
          axios.get("http://localhost:5098/api/admin/books"),
          axios.get("http://localhost:5098/api/admin/genres"),
        ]);

        // Filter books with discount > 0
        const discountedBooks = booksRes.data.filter(
          (book) => book.discount > 0
        );

        // Sort by discount percentage (highest first)
        discountedBooks.sort((a, b) => b.discount - a.discount);

        setBooks(discountedBooks);
        setCategories(genresRes.data.map((g) => g.name));
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-lg">Loading…</span>
      </div>
    );
  }

  // Pagination logic
  const totalPages = Math.ceil(books.length / booksPerPage);
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Handler for adding to cart
  const handleAddToCart = (book) => {
    const existingItem = cartItems.find((item) => item.id === book.id);

    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...book, quantity: 1 }]);
    }
  };

  // Handler for toggling bookmark
  const handleToggleBookmark = (book) => {
    const isBookmarked = bookmarks.some((item) => item.id === book.id);

    if (isBookmarked) {
      setBookmarks(bookmarks.filter((item) => item.id !== book.id));
    } else {
      setBookmarks([...bookmarks, book]);
    }
  };

  // Function to check if a book is bookmarked
  const isBookmarked = (bookId) => {
    return bookmarks.some((item) => item.id === bookId);
  };

  // Calculate discounted price
  const calculateDiscountedPrice = (price, discount) => {
    return (price * (1 - discount / 100)).toFixed(2);
  };

  // Calculate savings
  const calculateSavings = (price, discount) => {
    return (price * (discount / 100)).toFixed(2);
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
  <div className="bg-gradient-to-r from-blue-600 to-purple-800 text-white py-12">
    <div className="container mx-auto px-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">
        Special Offers
      </h1>
      <p className="text-lg opacity-90">
        Incredible deals on your favorite books
      </p>
    </div>
  </div>

  {/* Offers Content */}
  <section className="py-12 bg-white">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">Discounted Books</h2>
          <p className="text-gray-600">
            Limited time offers - grab them while you can!
          </p>
        </div>

        <div className="mt-4 md:mt-0">
          <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="discount-high">Sort by: Highest Discount</option>
            <option value="price-low">Sort by: Price (Low to High)</option>
            <option value="price-high">Sort by: Price (High to Low)</option>
            <option value="bestselling">Sort by: Bestselling</option>
          </select>
        </div>
      </div>

      {/* Featured Deals */}
      {currentPage === 1 && (
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-6">Featured Deals</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {books.slice(0, 2).map((book) => (
              <div
                key={book.bookId}
                className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="md:w-1/3 relative">
                  <img
                    src={book.image || "/placeholder.svg"}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    {book.discount}% OFF
                  </div>
                </div>
                <div className="md:w-2/3 p-6">
                  <h3 className="text-xl font-bold mb-2">{book.title}</h3>
                  <p className="text-gray-600 mb-2">
                    {book.authors?.[0] || "Unknown Author"}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {book.description?.substring(0, 150)}...
                  </p>

                  <div className="flex items-center mb-4">
                    <span className="text-2xl text-red-500 font-bold">
                      ${calculateDiscountedPrice(book.price, book.discount)}
                    </span>
                    <span className="text-gray-500 line-through text-lg ml-2">
                      ${book.price}
                    </span>
                    <span className="ml-4 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                      Save ${calculateSavings(book.price, book.discount)}
                    </span>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleAddToCart(book)}
                      className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition-colors"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleToggleBookmark(book)}
                      className={`p-2 border rounded ${
                        isBookmarked(book.bookId)
                          ? "text-red-500 border-red-500"
                          : "text-gray-500 border-gray-300"
                      } hover:text-red-500 hover:border-red-500`}
                    >
                      <Heart
                        size={18}
                        fill={
                          isBookmarked(book.bookId) ? "currentColor" : "none"
                        }
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Discounted Books */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        {currentBooks.map((book) => (
          <div
            key={book.bookId}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative">
              <img
                src={book.image || "/placeholder.svg"}
                alt={book.title}
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                {book.discount}% OFF
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg">{book.title}</h3>
              <p className="text-gray-600 mb-2">
                {book.authors?.[0] || "Unknown Author"}
              </p>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-red-500 font-bold">
                    ${calculateDiscountedPrice(book.price, book.discount)}
                  </span>
                  <span className="text-gray-500 line-through text-sm ml-2">
                    ${book.price}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleBookmark(book)}
                  className={`p-1 ${
                    isBookmarked(book.bookId) ? "text-red-500" : "text-gray-500"
                  } hover:text-red-500`}
                >
                  <Heart
                    size={18}
                    fill={
                      isBookmarked(book.bookId) ? "currentColor" : "none"
                    }
                  />
                </button>
              </div>
              <button
                onClick={() => handleAddToCart(book)}
                className="w-full mt-3 bg-green-600 text-white py-2 rounded hover:bg-green-500 transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-10 space-x-2">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`p-2 rounded-md ${
            currentPage === 1
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-green-100 text-green-800 hover:bg-green-200"
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
                  ? "bg-green-600 text-white"
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
              : "bg-green-100 text-green-800 hover:bg-green-200"
          }`}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="text-center mt-8">
        <p className="text-gray-600">
          Showing {indexOfFirstBook + 1}-
          {Math.min(indexOfLastBook, books.length)} of {books.length} books
        </p>
      </div>
    </div>
  </section>

  {/* Limited Time Offer Banner */}
  <section className="py-10 bg-blue-50">
    <div className="container mx-auto px-4">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 md:p-8 text-white text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Limited Time Offer
        </h2>
        <p className="text-lg mb-4">
          Use code <span className="font-bold">BOOKWORM25</span> at checkout
          for an extra 25% off on all discounted books!
        </p>
        <p className="text-sm opacity-80">
          Offer valid until May 31, 2025. Cannot be combined with other
          promotions.
        </p>
      </div>
    </div>
  </section>
</Layout>

  );
}
