import { Category } from "@/types/category";
import React from "react";
import Link from "next/link";

function CategoryIcon({ title }: { title: string }) {
  const key = title.toLowerCase();

  const commonProps = {
    className: "w-17.5 h-17.5 text-blue",
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  } as const;

  // Icons are simple, clean strokes that inherit currentColor (theme blue)
  if (key.includes("ipad")) {
    return (
      <svg {...commonProps} aria-hidden="true">
        <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 4.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="18.5" r="0.8" fill="currentColor" />
      </svg>
    );
  }

  if (key.includes("bag")) {
    return (
      <svg {...commonProps} aria-hidden="true">
        <rect x="4" y="8" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 8V7a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }

  if (key.includes("airpods")) {
    // Headset: arc headband with earcups
    return (
      <svg {...commonProps} aria-hidden="true">
        {/* Headband */}
        <path d="M6 11a6 6 0 0 1 12 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        {/* Earcups */}
        <rect x="4.5" y="11" width="3.5" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
        <rect x="16" y="11" width="3.5" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
        {/* Mic stem subtle */}
        <path d="M16.5 15.5v1.3a2.2 2.2 0 0 1-2.2 2.2H12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (key.includes("phone")) {
    return (
      <svg {...commonProps} aria-hidden="true">
        <rect x="7" y="3" width="10" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="18" r="0.9" fill="currentColor" />
      </svg>
    );
  }

  if (key.includes("computer")) {
    // Laptop: screen and base
    return (
      <svg {...commonProps} aria-hidden="true">
        <rect x="4" y="5" width="16" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 17h18l-1.5 2H4.5L3 17z" stroke="currentColor" strokeWidth="1.6" fill="none" />
      </svg>
    );
  }

  if (key.includes("charger") || key.includes("charge")) {
    // Apple-style wall charger: two top prongs, rounded block, small USB‑C port
    return (
      <svg {...commonProps} aria-hidden="true">
        {/* Prongs */}
        <path d="M10 5v2.2M14 5v2.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        {/* Charger block */}
        <rect x="7.5" y="7" width="9" height="9" rx="2.25" stroke="currentColor" strokeWidth="1.6" />
        {/* USB‑C port */}
        <path d="M11 15.8h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (key.includes("hard") || key.includes("disk")) {
    // SD/Flash card
    return (
      <svg {...commonProps} aria-hidden="true">
        <path d="M8 4l2-2h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8l4-4z" stroke="currentColor" strokeWidth="1.6" fill="none" />
        <rect x="10" y="4.5" width="1.5" height="3" fill="currentColor" />
        <rect x="12" y="4.5" width="1.5" height="3" fill="currentColor" />
        <rect x="14" y="4.5" width="1.5" height="3" fill="currentColor" />
      </svg>
    );
  }

  if (key.includes("convert")) {
    return (
      <svg {...commonProps} aria-hidden="true">
        <path d="M7 8h7l-2-2M17 16H10l2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (key.includes("printed") || key.includes("print")) {
    // Printed mug (taller body than handle, with steam)
    return (
      <svg {...commonProps} aria-hidden="true">
        {/* Mug body (taller) */}
        <rect x="8.5" y="6" width="7" height="10" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
        {/* Handle (shorter than mug height) */}
        <path d="M15.5 7.5h1a3 3 0 0 1 0 6h-1" stroke="currentColor" strokeWidth="1.6" />
        {/* Print area */}
        <circle cx="12" cy="11.5" r="1.6" stroke="currentColor" strokeWidth="1.6" />
        {/* Steam */}
        <path d="M10 4.8v1.7M12.5 4.5v2.1M15 4.8v1.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (key.includes("gift")) {
    return (
      <svg {...commonProps} aria-hidden="true">
        <rect x="3" y="9" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 12h18" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 9v11" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 9s-1.5-4 1.5-4 1.5 4 1.5 4M12 9s-1.5-4-4.5-4S9 9 9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  // Fallback generic category icon
  return (
    <svg {...commonProps} aria-hidden="true">
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 12h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const SingleItem = ({ item }: { item: Category & { slug?: string } }) => {
  return (
    <Link href={item.slug ? `/categories/${item.slug}` : "#"} className="group flex flex-col items-center">
      <div className="max-w-[130px] w-full bg-[#F2F3F8] h-32.5 rounded-full flex items-center justify-center mb-4">
        <CategoryIcon title={item.title} />
      </div>

      <div className="flex justify-center">
        <h3 className="inline-block font-semibold text-center text-dark bg-gradient-to-r from-blue to-blue bg-[length:0px_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_3px] group-hover:bg-[length:100%_1px] group-hover:text-blue">
          {item.title}
        </h3>
      </div>
    </Link>
  );
};

export default SingleItem;
