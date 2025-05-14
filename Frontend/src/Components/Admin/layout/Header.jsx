import { Bell, Search, User } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b border-gray-200 bg-blue-100 flex items-center justify-between px-6">
      <div className="flex items-center w-1/3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-md hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <div className="relative">
          <button className="relative h-8 w-8 rounded-full">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
