export function SyncCartLogoMark({ className = 'w-8 h-8' }) {
  return (
    <svg
      viewBox="0 0 40 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 7L11.5 25L19.5 11L27.5 25L35.5 7"
        stroke="#D9F951"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="35.5" cy="7" r="3.5" fill="#111612" stroke="#D9F951" strokeWidth="2.5" />
    </svg>
  )
}

export function DoodleCloud({ className = 'w-20 h-14' }) {
  return (
    <svg
      viewBox="0 0 110 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M26 58H84C94.5 58 102 50.8 102 41.5C102 33.1 95.4 26.2 87 25.4C84.8 14.3 74.9 6 63 6C51.6 6 42 13.6 39.2 24.1C37.1 23.4 34.8 23 32.5 23C22.8 23 15 30.6 15 40C15 41.3 15.2 42.6 15.5 43.8C10.5 45.8 7 50.5 7 56C7 57.1 7.9 58 9 58H26Z"
        fill="#FFFFFF"
        stroke="#111612"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32 48C35.5 49.5 41 49.5 45 47.5"
        stroke="#111612"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function DoodleBird({ className = 'w-16 h-16' }) {
  return (
    <svg
      viewBox="0 0 88 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Motion arcs behind bird */}
      <path
        d="M8 58C11 49 17 44 24 42"
        stroke="#111612"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M14 64C17 57 21 53 26 51"
        stroke="#111612"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Legs */}
      <path d="M44 56V69M44 69L40 71M44 69L48 71" stroke="#111612" strokeWidth="3" strokeLinecap="round" />
      <path d="M54 56V69M54 69L50 71M54 69L58 71" stroke="#111612" strokeWidth="3" strokeLinecap="round" />
      {/* Body */}
      <path
        d="M32 34C32 22.4 41.4 13 53 13C61.8 13 69.3 18.4 72.4 26.1C76.5 29.2 81 31.5 81 36.5C81 42.5 73.5 49 62.5 52.5C51.5 56 39 54 34.5 47C32.8 44.3 32 39.4 32 34Z"
        fill="#FFFFFF"
        stroke="#111612"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Wing */}
      <path
        d="M52 33C58 29 66 31 69 38C63 42 55 41 52 33Z"
        fill="#FFFFFF"
        stroke="#111612"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Beak */}
      <path
        d="M32 28L23 31L32 35Z"
        fill="#D9F951"
        stroke="#111612"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Eye */}
      <circle cx="43" cy="27" r="2.8" fill="#111612" />
      {/* Crest */}
      <path d="M47 13C46 8 49 6 52 8" stroke="#111612" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function DoodleWings({ className = 'w-full h-auto' }) {
  return (
    <svg
      viewBox="0 0 520 210"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Left wing */}
      <path
        d="M195 148C148 152 98 138 74 114C62 102 68 88 86 92C62 78 46 56 54 41C61 28 84 36 105 52C89 32 88 12 103 10C120 8 144 35 162 66C158 42 167 24 180 28C194 32 204 68 206 112"
        fill="#FFFFFF"
        stroke="#111612"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M188 164C144 174 96 168 78 151C70 143 79 131 99 133"
        fill="#FFFFFF"
        stroke="#111612"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Motion lines around left wing */}
      <path d="M36 66C29 52 33 34 45 24" stroke="#111612" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M48 128C38 118 35 104 39 92" stroke="#111612" strokeWidth="2.8" strokeLinecap="round" />

      {/* Right wing */}
      <path
        d="M325 148C372 152 422 138 446 114C458 102 452 88 434 92C458 78 474 56 466 41C459 28 436 36 415 52C431 32 432 12 417 10C400 8 376 35 358 66C362 42 353 24 340 28C326 32 316 68 314 112"
        fill="#FFFFFF"
        stroke="#111612"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M332 164C376 174 424 168 442 151C450 143 441 131 421 133"
        fill="#FFFFFF"
        stroke="#111612"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Motion lines around right wing */}
      <path d="M484 66C491 52 487 34 475 24" stroke="#111612" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M472 128C482 118 485 104 481 92" stroke="#111612" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  )
}

export function SoftCloudBed({ className = 'w-full h-auto' }) {
  return (
    <svg
      viewBox="0 0 860 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cloudBodyGrad" x1="430" y1="20" x2="430" y2="305" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="68%" stopColor="#F5F6F0" />
          <stop offset="100%" stopColor="#E2DFD5" />
        </linearGradient>
        <linearGradient id="cloudHighlightGrad" x1="200" y1="40" x2="680" y2="260" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#EDEAE0" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      {/* Back soft cloud layer */}
      <path
        d="M148 228C102 228 65 194 65 152C65 114 96 82 135 78C152 42 190 18 234 18C276 18 313 40 331 74C353 60 380 52 410 52C466 52 514 86 532 134C549 124 570 118 592 118C652 118 700 162 700 216C700 220 699 224 698 228H148Z"
        fill="url(#cloudHighlightGrad)"
      />
      {/* Main sculpted cloud sofa */}
      <path
        d="M118 268C68 268 28 231 28 185C28 145 58 111 98 104C116 62 158 34 208 34C247 34 282 52 304 80C331 61 365 50 402 50C466 50 521 86 544 139C566 125 593 116 622 116C698 116 760 172 760 242C760 264 745 282 718 288C664 300 546 306 418 306C284 306 176 292 118 268Z"
        fill="url(#cloudBodyGrad)"
      />
      {/* Subtle inner cloud contour lines */}
      <path
        d="M190 176C218 152 264 148 298 168"
        stroke="#D8D5CA"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M492 184C526 160 578 162 612 188"
        stroke="#D8D5CA"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

