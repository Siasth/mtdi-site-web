"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch() {
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/recherche?q=${encodeURIComponent(trimmed)}`);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <div className="flex items-center gap-0">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Rechercher..."
        className="w-40 sm:w-56 px-3 py-1.5 text-sm border border-r-0 border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-500"
        aria-label="Recherche sur le site"
      />
      <button
        onClick={handleSearch}
        aria-label="Lancer la recherche"
        className="px-3 py-1.5 bg-gray-800 text-white hover:bg-gray-700 transition-colors border border-gray-800"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>
    </div>
  );
}
