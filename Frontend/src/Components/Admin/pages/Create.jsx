import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

export default function CreateBook() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    isbn: "",
    price: "",
    availabilityStatus: "Available", // boolean matches backend
    publicationDate: "",
    publisher: "",
    format: "",
    language: "",
    description: "",
    inventoryQuantity: "",
    authorIds: [],
    genreIds: [],
  });
  const [imageFile, setImageFile] = useState(null);

  // 1) Load authors & genres on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    Promise.all([
      axios.get("http://localhost:5098/api/Admin/authors", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get("http://localhost:5098/api/Admin/genres", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([aRes, gRes]) => {
        setAuthors(aRes.data.map((a) => ({ id: a.authorId, name: a.name })));
        setGenres(gRes.data.map((g) => ({ id: g.genreId, name: g.name })));
      })
      .catch(() => setError("Failed to load authors or genres."));
  }, []);

  // 2) Handle inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = value;
    if (type === "checkbox") val = checked;
    setFormData({ ...formData, [name]: val });
  };

  const handleMultiSelect = (e, field) => {
    const opts = Array.from(e.target.selectedOptions).map((o) => +o.value);
    setFormData({ ...formData, [field]: opts });
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    setImageFile(e.target.files[0] || null);
  };

  // 3) Submit to API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("title", formData.title);
      data.append("isbn", formData.isbn);
      data.append("price", formData.price);
      data.append("availabilityStatus", formData.availabilityStatus);
      data.append("publicationDate", formData.publicationDate);
      data.append("publisher", formData.publisher);
      data.append("format", formData.format);
      data.append("language", formData.language);
      data.append("description", formData.description);
      data.append("inventoryQuantity", formData.inventoryQuantity);
      formData.authorIds.forEach((id) => data.append("authorIds", id));
      formData.genreIds.forEach((id) => data.append("genreIds", id));
      if (imageFile) data.append("ImageFile", imageFile);
      await axios.post("http://localhost:5098/api/Admin/books", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/admin/books");
    } catch {
      setError("Failed to create book. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
    <button
      onClick={() => navigate("/admin/books")}
      className="mr-4 p-2 rounded-md hover:bg-teal-200 flex items-center text-gray-700"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back
    </button>
    <h1 className="text-2xl font-bold">Add New Book</h1>
  </div>

  {error && (
    <div className="bg-yellow-50 text-yellow-600 p-3 rounded-md">{error}</div>
  )}

      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Book Title
              </label>
              <input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="isbn"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ISBN
              </label>
              <input
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Price
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="availabilityStatus"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Availability Status
              </label>
              <select
                id="availabilityStatus"
                name="availabilityStatus"
                value={formData.availabilityStatus}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Available">Available</option>
                <option value="OutOfStock">Out of Stock</option>
                <option value="PreOrder">Pre-Order</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="publicationDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Publication Date
              </label>
              <input
                id="publicationDate"
                name="publicationDate"
                type="date"
                value={formData.publicationDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="publisher"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Publisher
              </label>
              <input
                id="publisher"
                name="publisher"
                value={formData.publisher}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="imageFile"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Cover Image
            </label>
            <input
              id="imageFile"
              name="imageFile"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="format"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Format
              </label>
              <input
                id="format"
                name="format"
                value={formData.format}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="language"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Language
              </label>
              <input
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="inventoryQuantity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Inventory Quantity
              </label>
              <input
                id="inventoryQuantity"
                name="inventoryQuantity"
                type="number"
                value={formData.inventoryQuantity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1">Authors</label>
              <select
                name="authorIds"
                multiple
                className="w-full h-24 border p-2 rounded"
                onChange={(e) => handleMultiSelect(e, "authorIds")}
              >
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Genres</label>
              <select
                name="genreIds"
                multiple
                className="w-full h-24 border p-2 rounded"
                onChange={(e) => handleMultiSelect(e, "genreIds")}
              >
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/admin/books")}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Book"}
          </button>
        </div>
      </form>
    </div>
  );
}
