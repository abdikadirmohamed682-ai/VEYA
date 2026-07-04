export default function RecentOrders() {
  const orders = [
    {
      id: "#1001",
      customer: "Ahmed Ali",
      product: "Premium Hoodie",
      total: "$45",
      status: "Paid",
    },
    {
      id: "#1002",
      customer: "Mohamed Noor",
      product: "Wireless Mouse",
      total: "$22",
      status: "Pending",
    },
    {
      id: "#1003",
      customer: "Fatima Hassan",
      product: "Laptop Stand",
      total: "$39",
      status: "Paid",
    },
    {
      id: "#1004",
      customer: "Amina Yusuf",
      product: "Phone Case",
      total: "$15",
      status: "Shipped",
    },
  ];

  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Recent Orders
        </h2>

        <button className="text-sm font-semibold text-pink-500 hover:underline">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-4">Order</th>
              <th className="pb-4">Customer</th>
              <th className="pb-4">Product</th>
              <th className="pb-4">Total</th>
              <th className="pb-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b transition hover:bg-gray-50"
              >
                <td className="py-5 font-semibold">{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.product}</td>
                <td className="font-semibold">{order.total}</td>

                <td>
                  <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      order.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}