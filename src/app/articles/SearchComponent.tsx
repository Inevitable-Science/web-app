"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";

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
    onSearch(e.target.value);
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
            className="background-color absolute left-[-200px] h-10 w-48 rounded-full border border-grey-500 px-3 text-sm font-light outline-none ring-0 placeholder:text-muted-foreground focus:border-grey-100 focus:ring-0"
            initial={{ x: 200, opacity: 0 }} // Start position: 200px to the right, invisible
            animate={{ x: 0, opacity: 1 }} // End position: no translation, fully visible
            exit={{ x: 200, opacity: 0 }} // Exit: slide back to the right, fade out
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
