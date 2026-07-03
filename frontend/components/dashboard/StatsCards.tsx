export default function StatsCards() {
  const cards = [
    {
      title: "Total Sales",
      value: "$0.00",
      color: "text-pink-600",
    },
    {
      title: "Orders",
      value: "0",
      color: "text-blue-600",
    },
    {
      title: "Products",
      value: "0",
      color: "text-green-600",
    },
    {
      title: "Customers",
      value: "0",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <p className="text-sm text-gray-500">
            {card.title}
          </p>

          <h2 className={`mt-4 text-4xl font-bold ${card.color}`}>
            {card.value}
          </h2>
        </div>
      ))}

    </div>
  );
}