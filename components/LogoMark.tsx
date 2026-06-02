export default function LogoMark({ size = 24, color = '#7C72DD' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* left loop of infinity — doubles as left arm of psi */}
      <path
        d="M 20 13 C 18 5, 3 5, 3 13 C 3 21, 18 21, 20 13"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* right loop of infinity — doubles as right arm of psi */}
      <path
        d="M 20 13 C 22 5, 37 5, 37 13 C 37 21, 22 21, 20 13"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* psi vertical stem */}
      <line
        x1="20" y1="13"
        x2="20" y2="32"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* psi crossbar */}
      <line
        x1="13" y1="28"
        x2="27" y2="28"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}
