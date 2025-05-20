import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  Menu,
  X,
} from "lucide-react";

// Header Component
const Header = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  return (
    <>
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full lg:w-auto">
              <Link to="/" className="text-2xl font-bold text-blue-900">
                BookNest
              </Link>
              <button
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
            <div
              className={`${
                mobileMenuOpen ? "flex" : "hidden"
              } lg:flex items-center space-x-6`}
            >
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>
      <nav className="bg-blue-800 text-white">
        <div className="container mx-auto px-4">
          <div
            className={`${
              mobileMenuOpen ? "block" : "hidden"
            } lg:flex items-center`}
          >
            <ul className="lg:flex">
              <li>
                <Link
                  to="/"
                  className="block py-3 px-4 hover:bg-blue-700"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/new/arrivals"
                  className="block py-3 px-4 hover:bg-blue-700"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  to="/browse/books"
                  className="block py-3 px-4 hover:bg-blue-700"
                >
                  Browse Books
                </Link>
              </li>
              <li>
                <Link
                  to="/offers"
                  className="block py-3 px-4 hover:bg-blue-700"
                >
                  Offers
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="block py-3 px-4 hover:bg-blue-700"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

// BookDetails Component
const BookDetails = ({ selectedBook, setShowDetails, API_BASE }) => {
  if (!selectedBook) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-start justify-center overflow-y-auto py-12">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4">
        <div className="flex items-center border-b border-gray-200 px-6 py-4">
          <button
            onClick={() => setShowDetails(false)}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h2 className="ml-4 text-2xl font-semibold text-gray-800">
            {selectedBook.title}
          </h2>
        </div>
        <div className="px-6 py-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <img
                src={
                  selectedBook.imageUrl
                    ? `${API_BASE}${selectedBook.imageUrl}`
                    : `${API_BASE}/images/placeholder.png`
                }
                alt={selectedBook.title}
                className="w-48 h-64 object-cover rounded-lg shadow-md"
              />
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex items-start">
                <span className="w-24 text-gray-600 font-medium">ISBN:</span>
                <span className="text-gray-800">{selectedBook.isbn}</span>
              </div>
              <div className="flex items-start">
                <span className="w-24 text-gray-600 font-medium">Price:</span>
                <span className="text-gray-800">${selectedBook.price}</span>
              </div>
              <div className="flex items-start">
                <span className="w-24 text-gray-600 font-medium">Status:</span>
                <span className="text-gray-800">{selectedBook.availabilityStatus}</span>
              </div>
              <div className="flex items-start">
                <span className="w-24 text-gray-600 font-medium">Published:</span>
                <span className="text-gray-800">{new Date(selectedBook.publicationDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-start">
                <span className="w-24 text-gray-600 font-medium">Publisher:</span>
                <span className="text-gray-800">{selectedBook.publisher}</span>
              </div>
              <div className="flex items-start">
                <span className="w-24 text-gray-600 font-medium">Format:</span>
                <span className="text-gray-800">{selectedBook.format}</span>
              </div>
              <div className="flex items-start">
                <span className="w-24 text-gray-600 font-medium">Language:</span>
                <span className="text-gray-800">{selectedBook.language}</span>
              </div>
              <div className="flex items-start">
                <span className="w-24 text-gray-600 font-medium">In Stock:</span>
                <span className="text-gray-800">{selectedBook.inventoryQuantity}</span>
              </div>
              <div className="flex items-start">
                <span className="w-24 text-gray-600 font-medium">Authors:</span>
                <span className="text-gray-800">{selectedBook.authors.join(", ")}</span>
              </div>
              <div className="flex items-start">
                <span className="w-24 text-gray-600 font-medium">Genres:</span>
                <span className="text-gray-800">{selectedBook.genres.join(", ")}</span>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-xl font-medium text-gray-800 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {selectedBook.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [filterGenre, setFilterGenre] = useState("");
  const [genres, setGenres] = useState([]);
  const API_BASE = "http://localhost:5098";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [booksRes, genresRes] = await Promise.all([
          axios.get(`${API_BASE}/api/admin/books`),
          axios.get(`${API_BASE}/api/admin/genres`),
        ]);
        setBooks(booksRes.data);
        setGenres(genresRes.data.map((g) => g.name));
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-lg">Loading…</span>
      </div>
    );
  }

  // Filter and search books
  let filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.authors.join(", ").toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (filterGenre) {
    filteredBooks = filteredBooks.filter((book) =>
      book.genres.includes(filterGenre)
    );
  }

  // Sort books
  filteredBooks.sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title);
    if (sortBy === "price") return a.price - b.price;
    return 0;
  });

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const handleViewDetails = async (bookId) => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/books/${bookId}`);
      setSelectedBook(res.data);
      setShowDetails(true);
    } catch (err) {
      console.error("Failed to load book details:", err);
    }
  };

  return (
    <>
      <Header
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to BookNest</h1>
          <p className="text-lg mb-6">Explore a vast collection of books and find your next read.</p>
          <Link
            to="/register"
            className="bg-white text-blue-800 font-semibold px-6 py-3 rounded-md hover:bg-blue-50"
          >
            Register Now
          </Link>
        </div>
      </div>

      {/* Search, Sort, and Filter Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full lg:w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full lg:w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="title">Sort by Title</option>
              <option value="price">Sort by Price</option>
            </select>
            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="w-full lg:w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Book Catalogue */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Book Catalogue</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {currentBooks.map((book) => (
              <div
                key={book.bookId}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={
                      book.imageUrl
                        ? `${API_BASE}${book.imageUrl}`
                        : `${API_BASE}/images/placeholder.png`
                    }
                    alt={book.title}
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{book.title}</h3>
                  <p className="text-gray-600 mb-2">
                    {book.authors?.[0] || "Unknown Author"}
                  </p>
                  <p className="font-bold">${book.price}</p>
                  <button
                    onClick={() => handleViewDetails(book.bookId)}
                    className="w-full mt-3 bg-blue-800 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
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
              Showing {indexOfFirstBook + 1}-
              {Math.min(indexOfLastBook, filteredBooks.length)} of {filteredBooks.length} books
            </p>
          </div>
        </div>
      </section>

      {showDetails && (
        <BookDetails
          selectedBook={selectedBook}
          setShowDetails={setShowDetails}
          API_BASE={API_BASE}
        />
      )}
    </>
  );
}