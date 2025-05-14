import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateBook() {
  const [book, setBook] = useState({
    title: '',
    isbn: '',
    price: '',
    availabilityStatus: '',
    publicationDate: '',
    publisher: '',
    format: '',
    language: '',
    description: '',
    inventoryQuantity: '',
    authorIds: [],
    genreIds: [],
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook({ ...book, [name]: value });
  };

  const handleArrayChange = (e, field) => {
    const value = e.target.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    setBook({ ...book, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No token found. Please log in.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5098/api/Admin/books', {
        ...book,
        price: parseFloat(book.price),
        inventoryQuantity: parseInt(book.inventoryQuantity),
        publicationDate: new Date(book.publicationDate).toISOString(),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Book created successfully: ' + response.data.message);
      navigate('/create-book');
    } catch (error) {
      alert('Error creating book: ' + (error.response?.data?.error || 'Unauthorized'));
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create New Book</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={book.title}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">ISBN</label>
          <input
            type="text"
            name="isbn"
            value={book.isbn}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            name="price"
            value={book.price}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Availability Status</label>
          <input
            type="text"
            name="availabilityStatus"
            value={book.availabilityStatus}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Publication Date</label>
          <input
            type="datetime-local"
            name="publicationDate"
            value={book.publicationDate}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Publisher</label>
          <input
            type="text"
            name="publisher"
            value={book.publisher}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Format</label>
          <input
            type="text"
            name="format"
            value={book.format}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Language</label>
          <input
            type="text"
            name="language"
            value={book.language}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={book.description}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Inventory Quantity</label>
          <input
            type="number"
            name="inventoryQuantity"
            value={book.inventoryQuantity}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Author IDs (comma-separated)</label>
          <input
            type="text"
            name="authorIds"
            value={book.authorIds.join(',')}
            onChange={(e) => handleArrayChange(e, 'authorIds')}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g., 1, 2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Genre IDs (comma-separated)</label>
          <input
            type="text"
            name="genreIds"
            value={book.genreIds.join(',')}
            onChange={(e) => handleArrayChange(e, 'genreIds')}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g., 1"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
        >
          Create Book
        </button>
      </form>
    </div>
  );
}

export default CreateBook;