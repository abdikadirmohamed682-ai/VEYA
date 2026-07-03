export default function QuickActions() {
  const actions = [
    {
      title: "Create Store",
      subtitle: "Start your first online store",
    },
    {
      title: "Add Product",
      subtitle: "Upload your first product",
    },
    {
      title: "Orders",
      subtitle: "View customer orders",
    },
    {
      title: "Settings",
      subtitle: "Manage your account",
    },
  ];

  return (
    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

      <h2 className="text-2xl font-bold text-gray-900">
        Quick Actions
      </h2>

      <div className="mt-8 grid gap-6 md:grid-cols-2">

        {actions.map((item) => (
          <button
            key={item.title}
            className="rounded-2xl border border-gray-100 p-6 text-left transition hover:border-pink-400 hover:shadow-lg"
          >
            <h3 className="text-xl font-semibold">
              {item.title}
            </h3>

            <p className="mt-2 text-gray-500">
              {item.subtitle}
            </p>
          </button>
        ))}

      </div>

    </div>
  );
}