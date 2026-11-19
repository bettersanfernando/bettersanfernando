export default function HomeGeographicDecoration({
  className = '',
}: {
  className?: string;
}) {
  return (
    <img
      src="/assets/home-geographic-decoration.svg"
      alt=""
      width={800}
      height={788}
      className={`min-w-0 object-contain ${className}`}
      aria-hidden="true"
    />
  );
}
