// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Edit, Plus, Search, Trash2 } from "lucide-react";
// import axios from "axios";

// export default function Books() {
//   const [books, setBooks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [bookToDelete, setBookToDelete] = useState(null);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   useEffect(() => {
//     fetchBooks();
//   }, []);

//   const fetchBooks = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");
//       const response = await axios.get(
//         "http://localhost:5098/api/Admin/books",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setBooks(response.data);
//       setError("");
//     } catch (err) {
//       setError("Failed to fetch books. Please try again.");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteClick = (book) => {
//     setBookToDelete(book);
//     setDeleteDialogOpen(true);
//   };

//   const confirmDelete = async () => {
//     if (!bookToDelete) return;

//     try {
//       const token = localStorage.getItem("token");
//       await axios.delete(
//         `http://localhost:5098/api/Admin/books/${bookToDelete.bookId}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       setBooks(books.filter((book) => book.bookId !== bookToDelete.bookId));
//       setSuccess("Book deleted successfully");
//       setDeleteDialogOpen(false);

//       // Clear success message after 3 seconds
//       setTimeout(() => setSuccess(""), 3000);
//     } catch (err) {
//       setError("Failed to delete book. Please try again.");
//       console.error(err);
//     }
//   };

//   const filteredBooks = books.filter(
//     (book) =>
//       book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       book.isbn.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold">Books Management</h1>
//         <Link to="/admin/books/create">
//           <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
//             <Plus className="mr-2 h-4 w-4" />
//             Add New Book
//           </button>
//         </Link>
//       </div>

//       {error && (
//         <div className="bg-red-50 text-red-600 p-3 rounded-md">{error}</div>
//       )}

//       {success && (
//         <div className="bg-green-50 text-green-600 p-3 rounded-md">
//           {success}
//         </div>
//       )}

//       <div className="flex items-center">
//         <div className="relative flex-1 max-w-sm">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//           <input
//             placeholder="Search books..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
//           />
//         </div>
//       </div>

//       <div className="rounded-md border border-gray-200 overflow-hidden">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Title
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 ISBN
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Price
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Inventory
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Status
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Authors
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Genres
//               </th>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {loading ? (
//               <tr>
//                 <td colSpan={8} className="text-center py-10">
//                   Loading books...
//                 </td>
//               </tr>
//             ) : filteredBooks.length === 0 ? (
//               <tr>
//                 <td colSpan={8} className="text-center py-10">
//                   No books found.
//                 </td>
//               </tr>
//             ) : (
//               filteredBooks.map((book) => (
//                 <tr key={book.bookId}>
//                   <td className="px-6 py-4 whitespace-nowrap font-medium">
//                     {book.title}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">{book.isbn}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     ${book.price.toFixed(2)}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {book.inventoryQuantity}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs ${
//                         book.availabilityStatus === "Available"
//                           ? "bg-green-100 text-green-800"
//                           : book.availabilityStatus === "OutOfStock"
//                           ? "bg-red-100 text-red-800"
//                           : "bg-yellow-100 text-yellow-800"
//                       }`}
//                     >
//                       {book.availabilityStatus}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {book.authors.join(", ")}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {book.genres.join(", ")}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-right">
//                     <div className="flex justify-end space-x-2">
//                       <Link to={`/admin/books/edit/${book.bookId}`}>
//                         <button className="p-1 border border-gray-300 rounded-md hover:bg-gray-50">
//                           <Edit className="h-4 w-4" />
//                         </button>
//                       </Link>
//                       <button
//                         className="p-1 border border-gray-300 rounded-md hover:bg-gray-50"
//                         onClick={() => handleDeleteClick(book)}
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {deleteDialogOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg max-w-md w-full p-6">
//             <h3 className="text-lg font-medium mb-2">Confirm Deletion</h3>
//             <p className="text-gray-500 mb-4">
//               Are you sure you want to delete "{bookToDelete?.title}"? This
//               action cannot be undone.
//             </p>
//             <div className="flex justify-end space-x-2">
//               <button
//                 className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
//                 onClick={() => setDeleteDialogOpen(false)}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
//                 onClick={confirmDelete}
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import axios from "axios";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_BASE = "http://localhost:5098";

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5098/api/Admin/books",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBooks(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch books. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (book) => {
    setBookToDelete(book);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5098/api/Admin/books/${bookToDelete.bookId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBooks(books.filter((book) => book.bookId !== bookToDelete.bookId));
      setSuccess("Book deleted successfully");
      setDeleteDialogOpen(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete book. Please try again.");
      console.error(err);
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Books Management</h1>
        <Link to="/admin/books/create">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add New Book
          </button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md">{error}</div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md">
          {success}
        </div>
      )}

      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>
      </div>

      <div className="rounded-md border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cover
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ISBN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Inventory
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Authors
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Genres
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-10">
                  Loading books...
                </td>
              </tr>
            ) : filteredBooks.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-10">
                  No books found.
                </td>
              </tr>
            ) : (
              filteredBooks.map((book) => (
                <tr key={book.bookId}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <img
                      src={
                        book.imageUrl
                          ? `${API_BASE}${book.imageUrl}`
                          : `${API_BASE}/images/placeholder.png`
                      }
                      alt={book.title}
                      className="w-16 h-20 object-cover rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {book.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{book.isbn}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${book.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {book.inventoryQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        book.availabilityStatus === "Available"
                          ? "bg-green-100 text-green-800"
                          : book.availabilityStatus === "OutOfStock"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {book.availabilityStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {book.authors.join(", ")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {book.genres.join(", ")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-2">
                      <Link to={`/admin/books/edit/${book.bookId}`}>
                        <button className="p-1 border border-gray-300 rounded-md hover:bg-gray-50">
                          <Edit className="h-4 w-4" />
                        </button>
                      </Link>
                      <button
                        className="p-1 border border-gray-300 rounded-md hover:bg-gray-50"
                        onClick={() => handleDeleteClick(book)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-2">Confirm Deletion</h3>
            <p className="text-gray-500 mb-4">
              Are you sure you want to delete "{bookToDelete?.title}"? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
