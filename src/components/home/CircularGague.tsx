const CircularGauge = ({ percentage = 75, size = 100, strokeWidth = 10, label = "Funded" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percentage / 100);

  return (
    <svg width={size} height={size} className="transform">
      {/* Background Circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#121212" // Tailwind gray-200
        strokeWidth={strokeWidth}
        fill="none"
      />

      {/* Progress Circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#2978A0" // Tailwind blue-500
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
      />

      {/* Percentage Text */}
      <text
        x="50%"
        y="45%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="text-lg font-semibold fill-white"
          style={{ fontSize: "1.6rem" }}
      >
        {percentage}%
      </text>

      {/* Label Text */}
      <text
        x="50%"
        y="62%" // Position below the percentage
        dominantBaseline="middle"
        textAnchor="middle"
        className="text-sm uppercase fill-white font-light"
      >
        {label}
      </text>
    </svg>
  );
};

export default CircularGauge;