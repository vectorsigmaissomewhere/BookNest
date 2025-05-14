import { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Heart,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import Layout from "./Layout/Layout";

export default function BrowseBooks() {
  const [cartItems, setCartItems] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [books, setBooks] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(8);

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    genreId: null,
    minPrice: 0,
    maxPrice: 10000,
    format: [],
    language: [],
    availability: false,
    discount: false,
  });

  // Sort state
  const [sortOption, setSortOption] = useState({
    sortBy: "title",
    sortOrder: "asc",
  });

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
          search: filters.search,
          genreId: filters.genreId,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          sortBy: sortOption.sortBy,
          sortOrder: sortOption.sortOrder,
        };

        const [booksRes, genresRes, cartRes, bookmarksRes] = await Promise.all([
          axios.get(`${API_BASE}/api/books`, { params }),
          axios.get(`${API_BASE}/api/admin/genres`),
          axios.get(`${API_BASE}/api/cart`, { headers }),
          axios.get(`${API_BASE}/api/bookmarks`, { headers }),
        ]);

        setBooks(booksRes.data.items);
        setTotalItems(booksRes.data.totalItems);
        setCategories(genresRes.data);
        setCartItems(cartRes.data);
        setBookmarks(bookmarksRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentPage, filters, sortOption]);

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

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      switch (filterType) {
        case "search":
          newFilters.search = value;
          break;
        case "category":
          newFilters.genreId = value
            ? categories.find((g) => g.name === value)?.genreId
            : null;
          break;
        case "priceRange":
          newFilters.minPrice = value[0];
          newFilters.maxPrice = value[1];
          break;
        case "format":
        case "language":
          if (newFilters[filterType].includes(value)) {
            newFilters[filterType] = newFilters[filterType].filter(
              (item) => item !== value
            );
          } else {
            newFilters[filterType] = [...newFilters[filterType], value];
          }
          break;
        case "availability":
          newFilters.availability = !newFilters.availability;
          break;
        case "discount":
          newFilters.discount = !newFilters.discount;
          break;
        default:
          break;
      }
      return newFilters;
    });
    setCurrentPage(1); // Reset to first page
  };

  // Handle sort change
  const handleSortChange = (value) => {
    switch (value) {
      case "price-low":
        setSortOption({ sortBy: "price", sortOrder: "asc" });
        break;
      case "price-high":
        setSortOption({ sortBy: "price", sortOrder: "desc" });
        break;
      case "newest":
        setSortOption({ sortBy: "date", sortOrder: "desc" });
        break;
      default:
        setSortOption({ sortBy: "title", sortOrder: "asc" });
        break;
    }
    setCurrentPage(1); // Reset to first page
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      genreId: null,
      minPrice: 0,
      maxPrice: 10000,
      format: [],
      language: [],
      availability: false,
      discount: false,
    });
    setSortOption({ sortBy: "title", sortOrder: "asc" });
    setCurrentPage(1);
  };

  // Get unique formats from books
  const formats = [
    ...new Set(books.map((book) => book.format).filter(Boolean)),
  ];

  // Get unique languages from books
  const languages = [
    ...new Set(books.map((book) => book.language).filter(Boolean)),
  ];

  return (
    <Layout
      cartItems={cartItems}
      bookmarks={bookmarks}
      categories={categories.map((g) => g.name)}
      setShowCart={setShowCart}
      setShowBookmarks={setShowBookmarks}
    >
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse Books</h1>
          <p className="text-lg opacity-90">
            Explore our best collection of books
          </p>

          {/* Search Bar */}
          <div className="mt-6 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title, author, or ISBN..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full bg-white py-3 px-4 pr-10 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="absolute right-3 top-3 text-gray-500">
                <Search size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Browse Content */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Filter Toggle */}
            <button
              className="lg:hidden flex items-center justify-center gap-2 w-full py-2 px-4 bg-gray-100 rounded-md"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={18} />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>

            {/* Filters Sidebar */}
            <div
              className={`lg:w-1/4 ${
                showFilters ? "block" : "hidden"
              } lg:block`}
            >
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear All
                  </button>
                </div>

                {/* Categories Filter */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Categories</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map((category) => (
                      <label
                        key={category.genreId}
                        className="flex items-center"
                      >
                        <input
                          type="checkbox"
                          checked={filters.genreId === category.genreId}
                          onChange={() =>
                            handleFilterChange(
                              "category",
                              filters.genreId === category.genreId
                                ? null
                                : category.name
                            )
                          }
                          className="rounded text-blue-600 focus:ring-blue-500 mr-2"
                        />
                        <span className="text-gray-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <div className="px-2">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="100"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        handleFilterChange("priceRange", [
                          0,
                          Number.parseInt(e.target.value),
                        ])
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>$0</span>
                      <span>Up to ${filters.maxPrice}</span>
                    </div>
                  </div>
                </div>

                {/* Format Filter */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Format</h4>
                  <div className="space-y-2">
                    {formats.map((format, index) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.format.includes(format)}
                          onChange={() => handleFilterChange("format", format)}
                          className="rounded text-blue-600 focus:ring-blue-500 mr-2"
                        />
                        <span className="text-gray-700">{format}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Language Filter */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Language</h4>
                  <div className="space-y-2">
                    {languages.map((language, index) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.language.includes(language)}
                          onChange={() =>
                            handleFilterChange("language", language)
                          }
                          className="rounded text-blue-600 focus:ring-blue-500 mr-2"
                        />
                        <span className="text-gray-700">{language}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Other Filters */}
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.availability}
                      onChange={() => handleFilterChange("availability")}
                      className="rounded text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-gray-700">In Stock Only</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.discount}
                      onChange={() => handleFilterChange("discount")}
                      className="rounded text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-gray-700">On Sale</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Books Grid */}
            <div className="lg:w-3/4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold">All Books</h2>
                  <p className="text-gray-600">{totalItems} results found</p>
                </div>

                <div className="mt-4 sm:mt-0">
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={
                      sortOption.sortBy === "price" &&
                      sortOption.sortOrder === "asc"
                        ? "price-low"
                        : sortOption.sortBy === "price" &&
                          sortOption.sortOrder === "desc"
                        ? "price-high"
                        : sortOption.sortBy === "date" &&
                          sortOption.sortOrder === "desc"
                        ? "newest"
                        : "relevance"
                    }
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <option value="relevance">Sort by: Relevance</option>
                    <option value="newest">Sort by: Newest</option>
                    <option value="price-low">
                      Sort by: Price (Low to High)
                    </option>
                    <option value="price-high">
                      Sort by: Price (High to Low)
                    </option>
                  </select>
                </div>
              </div>

              {books.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <h3 className="text-xl font-semibold mb-2">No books found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search criteria
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-700"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {books.map((book) => (
                    <div
                      key={book.bookId}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
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
                        <h3 className="font-semibold text-lg">{book.title}</h3>
                        <p className="text-gray-600 mb-2">
                          {book.authors?.[0] || "Unknown Author"}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {book.discount > 0 ? (
                              <>
                                <span className="text-red-500 font-bold">
                                  $
                                  {calculateDiscountedPrice(
                                    book.price,
                                    book.discount
                                  )}
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
                            className={`p-1 ${
                              isBookmarked(book.bookId)
                                ? "text-red-500"
                                : "text-gray-500"
                            } hover:text-red-500`}
                          >
                            <Heart
                              size={18}
                              fill={
                                isBookmarked(book.bookId)
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </button>
                        </div>
                        <button
                          onClick={() => handleAddToCart(book.bookId)}
                          className="w-full mt-3 bg-blue-800 text-white py-2 rounded hover:bg-blue-700 transition-colors"
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
                              ? "bg-blue-800 text-white"
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
                      {Math.min(currentPage * booksPerPage, totalItems)} of{" "}
                      {totalItems} books
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
