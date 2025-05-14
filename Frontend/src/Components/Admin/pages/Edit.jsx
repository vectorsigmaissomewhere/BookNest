import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

export default function EditBook() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    isbn: "",
    price: "", // we'll parse to number on submit
    availabilityStatus: "Available",
    publicationDate: "", // YYYY-MM-DD
    publisher: "",
    format: "",
    language: "",
    description: "",
    inventoryQuantity: "", // parse to number on submit
    authorIds: [],
    genreIds: [],
  });

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const [aRes, gRes, bRes] = await Promise.all([
          axios.get("http://localhost:5098/api/Admin/authors", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5098/api/Admin/genres", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5098/api/Admin/books/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const authorsList = aRes.data.map((a) => ({
          id: a.authorId,
          name: a.name,
        }));
        const genresList = gRes.data.map((g) => ({
          id: g.genreId,
          name: g.name,
        }));

        setAuthors(authorsList);
        setGenres(genresList);

        const book = bRes.data;
        // match the existing authors/genres by name back to IDs
        const selectedAuthorIds = authorsList
          .filter((a) => book.authors.includes(a.name))
          .map((a) => a.id);
        const selectedGenreIds = genresList
          .filter((g) => book.genres.includes(g.name))
          .map((g) => g.id);

        setFormData({
          title: book.title,
          isbn: book.isbn,
          price: book.price.toString(),
          availabilityStatus: book.availabilityStatus,
          publicationDate: book.publicationDate.split("T")[0],
          publisher: book.publisher,
          format: book.format,
          language: book.language,
          description: book.description,
          inventoryQuantity: book.inventoryQuantity.toString(),
          authorIds: selectedAuthorIds,
          genreIds: selectedGenreIds,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [id]);

  const handleInputChange = ({ target: { name, value } }) => {
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleMultiSelect = (e, field) => {
    const values = Array.from(e.target.selectedOptions).map((o) =>
      parseInt(o.value, 10)
    );
    setFormData((f) => ({ ...f, [field]: values }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const token = localStorage.getItem("token");

    // Build JSON payload, converting numeric fields
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      inventoryQuantity: parseInt(formData.inventoryQuantity, 10),
    };

    try {
      await axios.put(`http://localhost:5098/api/Admin/books/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      navigate("/admin/books");
    } catch (err) {
      console.error(err);
      setError("Failed to update book. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-4 text-gray-600">Loading book details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => navigate("/admin/books")}
          className="mr-4 p-2 rounded-md hover:bg-gray-100 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <h1 className="text-2xl font-bold">Edit Book</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
        {/* — First Column — */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block mb-1">
                Book Title
              </label>
              <input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            {/* ISBN */}
            <div>
              <label htmlFor="isbn" className="block mb-1">
                ISBN
              </label>
              <input
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleInputChange}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            {/* Price */}
            <div>
              <label htmlFor="price" className="block mb-1">
                Price
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            {/* Availability */}
            <div>
              <label htmlFor="availabilityStatus" className="block mb-1">
                Availability Status
              </label>
              <select
                id="availabilityStatus"
                name="availabilityStatus"
                value={formData.availabilityStatus}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="Available">Available</option>
                <option value="OutOfStock">Out of Stock</option>
                <option value="PreOrder">Pre-Order</option>
              </select>
            </div>
            {/* Publication Date */}
            <div>
              <label htmlFor="publicationDate" className="block mb-1">
                Publication Date
              </label>
              <input
                id="publicationDate"
                name="publicationDate"
                type="date"
                value={formData.publicationDate}
                onChange={handleInputChange}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            {/* Publisher */}
            <div>
              <label htmlFor="publisher" className="block mb-1">
                Publisher
              </label>
              <input
                id="publisher"
                name="publisher"
                value={formData.publisher}
                onChange={handleInputChange}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* — Second Column — */}
          <div className="space-y-4">
            {/* Format */}
            <div>
              <label htmlFor="format" className="block mb-1">
                Format
              </label>
              <input
                id="format"
                name="format"
                value={formData.format}
                onChange={handleInputChange}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            {/* Language */}
            <div>
              <label htmlFor="language" className="block mb-1">
                Language
              </label>
              <input
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            {/* Inventory Quantity */}
            <div>
              <label htmlFor="inventoryQuantity" className="block mb-1">
                Inventory Quantity
              </label>
              <input
                id="inventoryQuantity"
                name="inventoryQuantity"
                type="number"
                value={formData.inventoryQuantity}
                onChange={handleInputChange}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            {/* Authors */}
            <div>
              <label htmlFor="authorIds" className="block mb-1">
                Authors
              </label>
              <select
                id="authorIds"
                name="authorIds"
                multiple
                value={formData.authorIds}
                onChange={(e) => handleMultiSelect(e, "authorIds")}
                className="w-full h-24 border px-2 py-1 rounded"
                required
              >
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Genres */}
            <div>
              <label htmlFor="genreIds" className="block mb-1">
                Genres
              </label>
              <select
                id="genreIds"
                name="genreIds"
                multiple
                value={formData.genreIds}
                onChange={(e) => handleMultiSelect(e, "genreIds")}
                className="w-full h-24 border px-2 py-1 rounded"
                required
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

        {/* Description */}
        <div>
          <label htmlFor="description" className="block mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={5}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/admin/books")}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
