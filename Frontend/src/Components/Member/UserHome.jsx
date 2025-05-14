import { useState, useEffect } from "react";
import axios from "axios";
import Bookimg from "../../assets/bookimage.png";
import {
  X,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingCart,
  Package,
  Star,
} from "lucide-react";
import Layout from "../Member/Layout/Layout";

// Cart Component
const Cart = ({
  cartItems,
  setCartItems,
  setShowCart,
  calculateTotal,
  calculateDiscountedPrice,
  updateQuantity,
  removeFromCart,
  API_BASE,
}) => {
  const [orderStatus, setOrderStatus] = useState(null);

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setOrderStatus("Please log in to place an order.");
        return;
      }

      const orderRequest = {
        OrderItems: cartItems.map((item) => ({
          BookId: item.bookId,
          Quantity: item.quantity,
        })),
      };

      const response = await axios.post(`${API_BASE}/api/order`, orderRequest, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrderStatus(
        `Order placed successfully! Claim Code: ${response.data.claimCode}. A confirmation email with your bill has been sent to your registered email.`
      );
      setCartItems([]); // Clear cart after successful order
      setTimeout(() => setShowCart(false), 3000); // Hide cart after 3 seconds
    } catch (err) {
      console.error("Checkout Error:", err.response || err);
      setOrderStatus(
        err.response?.data?.error || "Failed to place order. Please try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setShowCart(false)}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold">
            Your Shopping Cart ({cartItems.length})
          </h2>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">
              Looks like you haven't added any books to your cart yet.
            </p>
            <button
              onClick={() => setShowCart(false)}
              className="bg-blue-800 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow mb-8">
              {cartItems.map((item) => (
                <div
                  key={item.bookId}
                  className="border-b border-gray-200 p-4 flex items-center"
                >
                  <img
                    src={`${API_BASE}${item.imageUrl}`}
                    alt={item.title}
                    className="w-20 h-24 object-cover rounded mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-gray-500 text-sm">{item.authors?.[0]}</p>
                    <div className="flex items-center mt-1">
                      {item.discount > 0 ? (
                        <>
                          <span className="text-red-500 font-bold">
                            $
                            {calculateDiscountedPrice(
                              item.price,
                              item.discount
                            )}
                          </span>
                          <span className="text-gray-500 line-through text-sm ml-2">
                            ${item.price}
                          </span>
                        </>
                      ) : (
                        <span className="font-bold">${item.price}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        updateQuantity(item.bookId, item.quantity - 1)
                      }
                      className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span className="mx-3">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.bookId, item.quantity + 1)
                      }
                      className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.bookId)}
                    className="ml-4 text-gray-400 hover:text-red-500"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              <div className="p-4 bg-gray-50">
                <div className="flex justify-between py-2">
                  <span>Subtotal</span>
                  <span>${calculateTotal()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between py-2 font-bold">
                  <span>Total</span>
                  <span>${calculateTotal()}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setShowCart(false)}
                className="px-6 py-2 border border-blue-800 text-blue-800 rounded hover:bg-blue-50"
              >
                Continue Shopping
              </button>
              <button
                onClick={handleCheckout}
                className="px-6 py-2 bg-blue-800 text-white rounded hover:bg-blue-700"
              >
                Checkout
              </button>
            </div>
            {orderStatus && (
              <p
                className={`mt-4 text-center text-sm ${
                  orderStatus.includes("successfully")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {orderStatus}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Orders Component
const Orders = ({ orders, setShowOrders, handleCancelOrder, API_BASE }) => {
  const [cancelStatus, setCancelStatus] = useState(null);

  const handleCancel = async (orderId) => {
    try {
      const message = await handleCancelOrder(orderId);
      setCancelStatus(message);
      setTimeout(() => setCancelStatus(null), 3000);
    } catch (err) {
      setCancelStatus(err.message);
      setTimeout(() => setCancelStatus(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setShowOrders(false)}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold">Your Orders ({orders.length})</h2>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">
              You haven't placed any orders yet.
            </p>
            <button
              onClick={() => setShowOrders(false)}
              className="bg-blue-800 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Browse Books
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow mb-8">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="border-b border-gray-200 p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">
                      Order #{order.orderId} - {order.claimCode}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Total: ${order.totalAmount.toFixed(2)}
                  </p>
                  <div className="mt-2">
                    {order.orderItems.map((item) => (
                      <p
                        key={item.orderItemId}
                        className="text-sm text-gray-600"
                      >
                        {item.bookTitle} (Qty: {item.quantity}) - $
                        {(item.unitPrice * item.quantity).toFixed(2)}
                      </p>
                    ))}
                  </div>
                  {order.status === "Pending" && (
                    <button
                      onClick={() => handleCancel(order.orderId)}
                      className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              ))}
            </div>
            {cancelStatus && (
              <p
                className={`mt-4 text-center text-sm ${
                  cancelStatus.includes("successfully")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {cancelStatus}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Bookmarks Component
const Bookmarks = ({
  bookmarks,
  setBookmarks,
  setShowBookmarks,
  handleAddToCart,
  calculateDiscountedPrice,
  removeFromBookmarks,
  API_BASE,
}) => {
  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setShowBookmarks(false)}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold">
            Your Bookmarks ({bookmarks.length})
          </h2>
        </div>

        {bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <Heart size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Your bookmark list is empty
            </h3>
            <p className="text-gray-500 mb-6">
              Save your liked books for later.
            </p>
            <button
              onClick={() => setShowBookmarks(false)}
              className="bg-blue-800 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Browse Books
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookmarks.map((book) => (
              <div
                key={book.bookId}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
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
                  <p className="text-gray-600 mb-2">{book.authors?.[0]}</p>
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
                      onClick={() => removeFromBookmarks(book.bookId)}
                      className="p-1 text-red-500 hover:text-gray-500"
                    >
                      <Heart size={18} fill="currentColor" />
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
      </div>
    </div>
  );
};

// DetailRow Component
const DetailRow = ({ label, value }) => (
  <div className="flex items-start">
    <span className="w-24 text-gray-600 font-medium">{label}:</span>
    <span className="text-gray-800">{value}</span>
  </div>
);

// BookDetails Component
const BookDetails = ({
  selectedBook,
  setShowDetails,
  API_BASE,
  user,
  handleAddReview,
  reviews,
  canReview,
  reviewStatus,
}) => {
  if (!selectedBook) return null;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to submit a review.");
      return;
    }
    if (!canReview) {
      alert("You can only review books you have purchased.");
      return;
    }
    await handleAddReview(selectedBook.bookId, rating, comment);
    setRating(0);
    setComment("");
  };

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
                src={`${API_BASE}${selectedBook.imageUrl}`}
                alt={selectedBook.title}
                className="w-48 h-64 object-cover rounded-lg shadow-md"
              />
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <DetailRow label="ISBN" value={selectedBook.isbn} />
              <DetailRow label="Price" value={`$${selectedBook.price}`} />
              <DetailRow
                label="Status"
                value={selectedBook.availabilityStatus}
              />
              <DetailRow
                label="Published"
                value={new Date(
                  selectedBook.publicationDate
                ).toLocaleDateString()}
              />
              <DetailRow label="Publisher" value={selectedBook.publisher} />
              <DetailRow label="Format" value={selectedBook.format} />
              <DetailRow label="Language" value={selectedBook.language} />
              <DetailRow
                label="In Stock"
                value={selectedBook.inventoryQuantity}
              />
              <DetailRow
                label="Authors"
                value={selectedBook.authors.join(", ")}
              />
              <DetailRow
                label="Genres"
                value={selectedBook.genres.join(", ")}
              />
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              Description
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {selectedBook.description}
            </p>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-xl font-medium text-gray-800 mb-4">Reviews</h3>
            {reviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet for this book.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.reviewId}
                    className="border-b border-gray-200 pb-4"
                  >
                    <div className="flex items-center mb-2">
                      <span className="font-semibold">{review.username}</span>
                      <div className="flex ml-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={
                              i < review.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">
                      {review.comment || "No comment provided."}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Posted on{" "}
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {user && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-xl font-medium text-gray-800 mb-4">
                Write a Review
              </h3>
              {canReview ? (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Rating
                    </label>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={24}
                          className={`cursor-pointer ${
                            i < (hoverRating || rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                          onClick={() => setRating(i + 1)}
                          onMouseEnter={() => setHoverRating(i + 1)}
                          onMouseLeave={() => setHoverRating(0)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="comment"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Comment (optional)
                    </label>
                    <textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="4"
                      maxLength="500"
                      placeholder="Share your thoughts about the book..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={rating === 0}
                    className={`w-full py-2 px-4 rounded-md ${
                      rating === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-800 text-white hover:bg-blue-700"
                    }`}
                  >
                    Submit Review
                  </button>
                  {reviewStatus && (
                    <p
                      className={`mt-2 text-sm text-center ${
                        reviewStatus.includes("successfully")
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {reviewStatus}
                    </p>
                  )}
                </form>
              ) : (
                <p className="text-gray-500">
                  You can only review books you have purchased.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main UserHome Component
export default function UserHome() {
  const [cartItems, setCartItems] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState([]);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(5);
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewStatus, setReviewStatus] = useState(null);
  const API_BASE = "http://localhost:5098";

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [
          booksRes,
          genresRes,
          announcementsRes,
          ordersRes,
          cartRes,
          bookmarksRes,
          userRes,
        ] = await Promise.all([
          axios.get(`${API_BASE}/api/books`),
          axios.get(`${API_BASE}/api/admin/genres`),
          axios.get(`${API_BASE}/api/member/announcements/active`),
          axios.get(`${API_BASE}/api/order/my-orders`, { headers }),
          axios.get(`${API_BASE}/api/cart`, { headers }),
          axios.get(`${API_BASE}/api/bookmarks`, { headers }),
          token
            ? axios.get(`${API_BASE}/api/auth/me`, { headers })
            : Promise.resolve({ data: null }),
        ]);
        setBooks(booksRes.data.items);
        setCategories(genresRes.data.map((g) => g.name));
        setAnnouncements(announcementsRes.data);
        setOrders(ordersRes.data);
        setCartItems(cartRes.data);
        setBookmarks(bookmarksRes.data);
        setUser(userRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchReviewsAndPurchaseStatus() {
      if (!selectedBook) return;

      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [reviewsRes, ordersRes] = await Promise.all([
          axios.get(`${API_BASE}/api/review/book/${selectedBook.bookId}`),
          token
            ? axios.get(`${API_BASE}/api/order/my-orders`, { headers })
            : Promise.resolve({ data: [] }),
        ]);

        setReviews(reviewsRes.data);

        const hasPurchased = ordersRes.data.some(
          (order) =>
            order.status === "Delivered" &&
            order.orderItems.some((item) => item.bookId === selectedBook.bookId)
        );
        setCanReview(hasPurchased);
      } catch (err) {
        console.error("Error fetching reviews or purchase status:", err);
        setReviews([]);
        setCanReview(false);
      }
    }
    fetchReviewsAndPurchaseStatus();
  }, [selectedBook]);

  const handleCancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE}/api/order/${orderId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders(
        orders.map((order) =>
          order.orderId === orderId ? { ...order, status: "Cancelled" } : order
        )
      );
      return response.data.message;
    } catch (err) {
      throw new Error(err.response?.data?.error || "Failed to cancel order.");
    }
  };

  const handleAddReview = async (bookId, rating, comment) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE}/api/review`,
        { bookId, rating, comment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReviews([...reviews, response.data]);
      setCanReview(false); // Prevent multiple reviews
      setReviewStatus("Review submitted successfully!");
      setTimeout(() => setReviewStatus(null), 3000);
    } catch (err) {
      setReviewStatus(err.response?.data?.error || "Failed to submit review.");
      setTimeout(() => setReviewStatus(null), 3000);
    }
  };

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

  const removeFromCart = async (bookId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/api/cart/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartRes = await axios.get(`${API_BASE}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(cartRes.data);
    } catch (err) {
      console.error("Error removing from cart:", err);
      alert(err.response?.data?.error || "Failed to remove from cart.");
    }
  };

  const removeFromBookmarks = async (bookId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/api/bookmarks/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bookmarksRes = await axios.get(`${API_BASE}/api/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookmarks(bookmarksRes.data);
    } catch (err) {
      console.error("Error removing bookmark:", err);
      alert(err.response?.data?.error || "Failed to remove bookmark.");
    }
  };

  const updateQuantity = async (bookId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/api/cart/${bookId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const cartRes = await axios.get(`${API_BASE}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(cartRes.data);
    } catch (err) {
      console.error("Error updating quantity:", err);
      alert(err.response?.data?.error || "Failed to update quantity.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-lg">Loading…</span>
      </div>
    );
  }

  const totalPages = Math.ceil(books.length / booksPerPage);
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const handleViewDetails = async (bookId) => {
    try {
      const res = await axios.get(`${API_BASE}/api/books/${bookId}`);
      setSelectedBook(res.data);
      setShowDetails(true);
    } catch (err) {
      console.error("Failed to load book details:", err);
    }
  };

  const isBookmarked = (bookId) =>
    bookmarks.some((item) => item.bookId === bookId);

  const calculateDiscountedPrice = (price, discount) =>
    (price * (1 - discount / 100)).toFixed(2);

  const calculateTotal = () =>
    cartItems
      .reduce((total, item) => {
        const price =
          item.discount > 0
            ? calculateDiscountedPrice(item.price, item.discount)
            : item.price;
        return total + price * item.quantity;
      }, 0)
      .toFixed(2);

  return (
    <Layout
      cartItems={cartItems}
      bookmarks={bookmarks}
      categories={categories}
      orders={orders}
      setShowCart={setShowCart}
      setShowBookmarks={setShowBookmarks}
      setShowOrders={setShowOrders}
    >
      {showDetails && (
        <BookDetails
          selectedBook={selectedBook}
          setShowDetails={setShowDetails}
          API_BASE={API_BASE}
          user={user}
          handleAddReview={handleAddReview}
          reviews={reviews}
          canReview={canReview}
          reviewStatus={reviewStatus}
        />
      )}
      {showCart && (
        <Cart
          cartItems={cartItems}
          setCartItems={setCartItems}
          setShowCart={setShowCart}
          calculateTotal={calculateTotal}
          calculateDiscountedPrice={calculateDiscountedPrice}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          API_BASE={API_BASE}
        />
      )}
      {showBookmarks && (
        <Bookmarks
          bookmarks={bookmarks}
          setBookmarks={setBookmarks}
          setShowBookmarks={setShowBookmarks}
          handleAddToCart={handleAddToCart}
          calculateDiscountedPrice={calculateDiscountedPrice}
          removeFromBookmarks={removeFromBookmarks}
          API_BASE={API_BASE}
        />
      )}
      {showOrders && (
        <Orders
          orders={orders}
          setShowOrders={setShowOrders}
          handleCancelOrder={handleCancelOrder}
          API_BASE={API_BASE}
        />
      )}

      {announcements.length > 0 && (
        <section className="py-8 bg-yellow-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Announcements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map((announcement) => (
                <div
                  key={announcement.announcementId}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <p className="text-gray-700 mb-4">{announcement.message}</p>
                  <div className="text-sm text-gray-500">
                    <p>
                      Starts:{" "}
                      {new Date(announcement.startDate).toLocaleDateString()}
                    </p>
                    <p>
                      Ends:{" "}
                      {new Date(announcement.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 space-y-4">
            <h1 className="text-4xl font-bold">
              Discover Your Next Favorite Book
            </h1>
            <p className="text-lg">
              Browse through our collection of thousands of books from around
              the world.
            </p>
            <div className="flex space-x-4">
              <button className="bg-white text-blue-800 font-semibold px-6 py-2 rounded-md hover:bg-blue-50">
                Shop Now
              </button>
              <button className="border border-white px-6 py-2 rounded-md hover:bg-blue-700">
                Learn More
              </button>
            </div>
          </div>
          <div className="flex justify-center">
            <img
              src={Bookimg || `${API_BASE}/images/placeholder.png`}
              alt="Books collection"
              className="rounded-lg shadow-lg h-64 p-2 bg-white object-cover"
            />
          </div>
        </div>
      </div>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Featured Books
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {currentBooks.map((book) => (
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
                          isBookmarked(book.bookId) ? "currentColor" : "none"
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
                  <button
                    onClick={() => handleViewDetails(book.bookId)}
                    className="w-full mt-2 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition-colors"
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
              {Math.min(indexOfLastBook, books.length)} of {books.length} books
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Popular Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((category, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-lg text-blue-800">
                  {category}
                </h3>
                <p className="text-gray-500 text-sm mt-1">Explore Books</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
