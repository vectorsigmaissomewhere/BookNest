export default function Footer() {
  return (
    <footer className="bg-blue-800 text-white pt-12 pb-6">
  <div className="container mx-auto px-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
      <div>
        <h3 className="text-xl font-bold mb-4">Online Book Store</h3>
        <p className="text-gray-300 mb-4">
          Your trusted online bookstore with a wide selection of books from
          around the world.
        </p>
        <div className="flex space-x-4">
          <a href="#" className="text-gray-300 hover:text-white">
            {/* SVG icons here */}
          </a>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
        <ul className="space-y-2">
          <li>
            <a href="#" className="text-gray-300 hover:text-white">
              Home
            </a>
          </li>
          <li>
            <a href="#" className="text-gray-300 hover:text-white">
              About Us
            </a>
          </li>
          {/* Other list items */}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
        <ul className="space-y-2">
          <li>
            <a href="#" className="text-gray-300 hover:text-white">
              FAQ
            </a>
          </li>
          {/* Other list items */}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
        <ul className="space-y-2 text-gray-300">
          <li>Sunsari, Itahari</li>
          <li>Nepal</li>
          <li>Phone: +977-989898989898</li>
          <li>Email: info@book.com</li>
        </ul>
      </div>
    </div>

    <div className="border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
      <p>&copy; 2025 BookNest. All rights reserved.</p>
    </div>
  </div>
</footer>

  );
}
