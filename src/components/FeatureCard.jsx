export default function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="card text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600">
        <Icon size={28} />
      </div>
      <h3 className="mt-4 text-xl font-bold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{text}</p>
    </div>
  );
}
