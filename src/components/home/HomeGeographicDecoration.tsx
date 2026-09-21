import {
  CITY_SVG_VIEWBOX,
  CITY_OUTLINE_PATH,
  BARANGAY_SVG_PATHS,
} from '../../data/civic/cityBoundarySvgData';

export default function HomeGeographicDecoration({
  className = '',
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox={CITY_SVG_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Subtle cadastral / civic-grid axis markers */}
      <line
        x1="0"
        y1="394"
        x2="800"
        y2="394"
        stroke="#ffffff"
        strokeWidth="0.5"
        strokeOpacity="0.025"
        strokeDasharray="4 8"
      />
      <line
        x1="400"
        y1="0"
        x2="400"
        y2="788"
        stroke="#ffffff"
        strokeWidth="0.5"
        strokeOpacity="0.025"
        strokeDasharray="4 8"
      />

      {/* City outline — crisp, subtle 11% stroke opacity */}
      <path
        d={CITY_OUTLINE_PATH}
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeOpacity="0.11"
        fill="none"
      />

      {/* 35 Barangay internal boundaries — crisp, subtle 5% stroke opacity */}
      {BARANGAY_SVG_PATHS.map(barangay => (
        <path
          key={barangay.psgc}
          d={barangay.d}
          stroke="#ffffff"
          strokeWidth="0.65"
          strokeOpacity="0.05"
          fill="none"
        />
      ))}
    </svg>
  );
}
