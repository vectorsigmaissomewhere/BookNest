import React, { useEffect, useState } from "react";
import axios from "axios";

const BookDetail = () => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch book details
  const fetchBookDetails = async () => {
    try {
      const response = await axios.get("http://localhost:5098/api/Books/2");
      setBook(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetails();
  }, []);

  if (loading) return <p>Loading book details...</p>;
  if (error) return <p>Error fetching book details: {error}</p>;
  if (!book) return null;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1>{book.title}</h1>
      <img
        src={`http://localhost:5098${book.imageUrl}`}
        alt={book.title}
        style={{ maxWidth: "100%", marginBottom: "20px" }}
      />
      <p><strong>ISBN:</strong> {book.isbn}</p>
      <p><strong>Price:</strong> ${book.price}</p>
      <p><strong>Availability:</strong> {book.availabilityStatus}</p>
      <p><strong>Publication Date:</strong> {new Date(book.publicationDate).toDateString()}</p>
      <p><strong>Publisher:</strong> {book.publisher}</p>
      <p><strong>Format:</strong> {book.format}</p>
      <p><strong>Language:</strong> {book.language}</p>
      <p><strong>Description:</strong> {book.description}</p>
      <p><strong>Author(s):</strong> {book.authors.join(", ")}</p>
      <p><strong>Genre(s):</strong> {book.genres.join(", ")}</p>
    </div>
  );
};

export default BookDetail;
