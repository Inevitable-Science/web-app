/*// components/SearchBar.tsx
"use client"; // Required for client-side interactivity in Next.js App Router

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react"; // Assuming you're using Lucide icons for the Search icon

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative flex items-center">
      {/* Search Icon * /}
      <button onClick={handleToggle} aria-label="Toggle search" className={isOpen ? "bg-grey-450" : ""}>
        <Search height={24} width={24} className="cursor-pointer" />
      </button>

      {/* Animated Textbox * /}
      <AnimatePresence>
        {isOpen && (
          <motion.input
            type="text"
            placeholder="Search WIP..."
            className="absolute font-light left-[-200px] h-10 w-48 rounded-md border border-grey-500 bg-transparent px-3 text-black placeholder:text-muted-foreground outline-none focus:outline-none"
            initial={{ x: 200, opacity: 0 }} // Start position: 200px to the right, invisible
            animate={{ x: 0, opacity: 1 }} // End position: no translation, fully visible
            exit={{ x: 200, opacity: 0 }} // Exit: slide back to the right, fade out
            transition={{ duration: 0.3, ease: "easeOut" }} // Animation timing
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;*/


"use client"; // Required for client-side interactivity in Next.js App Router

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react"; // Assuming you're using Lucide icons for the Search icon

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch(e.target.value); // Call the callback with the current query
  };

  return (
    <div className="relative flex items-center">
      {/* Search Icon */}
      <button
        onClick={handleToggle}
        aria-label="Toggle search"
        className={isOpen ? "" : "opacity-60"}
      >
        <Search height={24} width={24} className="cursor-pointer" />
      </button>

      {/* Animated Textbox */}
      <AnimatePresence>
        {isOpen && (
          <motion.input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search articles"
            className="absolute font-light left-[-200px] h-10 w-48 rounded-full text-sm border border-grey-500 background-color px-3 placeholder:text-muted-foreground outline-none focus:border-grey-100 ring-0 focus:ring-0"
            initial={{ x: 200, opacity: 0 }} // Start position: 200px to the right, invisible
            animate={{ x: 0, opacity: 1 }} // End position: no translation, fully visible
            exit={{ x: 200, opacity: 0 }} // Exit: slide back to the right, fade out
            transition={{ duration: 0.3, ease: "easeOut" }} // Animation timing
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;