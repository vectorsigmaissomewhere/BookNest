import {
  BarChart3,
  BookOpen,
  DollarSign,
  ShoppingCart,
  Users,
} from "lucide-react";

const stats = [
  {
    title: "Total Revenue",
    value: "$25,678",
    icon: DollarSign,
    change: "+8%",
    trend: "up",
  },
  {
    title: "Total Books",
    value: "520",
    icon: BookOpen,
    change: "+3%",
    trend: "up",
  },
  {
    title: "Total Users",
    value: "5,678",
    icon: Users,
    change: "+15%",
    trend: "up",
  },
  {
    title: "Total Orders",
    value: "1,200",
    icon: ShoppingCart,
    change: "-1%",
    trend: "down",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <select className="border rounded-md px-3 py-1.5 bg-white">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between pb-2">
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <stat.icon className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p
              className={`text-xs ${
                stat.trend === "up" ? "text-green-500" : "text-red-500"
              } flex items-center mt-1`}
            >
              {stat.change}
              <span className="ml-1">from last period</span>
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Recent Sales</h3>
          <div className="h-[300px] flex items-center justify-center">
            <BarChart3 className="h-16 w-16 text-gray-300" />
            <p className="ml-4 text-gray-500">Sales chart will appear here</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Popular Books</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center">
                <div className="h-10 w-10 bg-gray-200 rounded"></div>
                <div className="ml-4">
                  <p className="font-medium">Book Title {i}</p>
                  <p className="text-sm text-gray-500">
                    Sold: {Math.floor(Math.random() * 100)} copies
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
