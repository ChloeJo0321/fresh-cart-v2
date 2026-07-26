"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "./Search.module.css";
import { X } from "lucide-react";

type ProductSuggestion = {
  searchKeyword: string;
};

export default function Search() {
  // Current word in input field
  const [searchWord, setSearchWord] = useState("");
  // User input word
  const [typedWord, setTypedWord] = useState("");
  // List of suggested words
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Clear all state variables
    if (pathname !== "/search") {
      setSearchWord("");
      setTypedWord("");
      setSuggestions([]);
      setIsSuggestionOpen(false);
      setCurrentIndex(-1);
    }
  }, [pathname]);

  useEffect(() => {
    // Prevent old response overwriting new response
    let ignore = false;

    // Find all suggested words that match user's input
    const findSuggestions = async () => {
      const trimmedTypedWord = typedWord.trim();

      if (!trimmedTypedWord) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(trimmedTypedWord)}`,
        );

        // N:
        if (!res.ok) {
          if (!ignore) {
            setSuggestions([]);
          }
          return;
        }

        const data: ProductSuggestion[] = await res.json();

        if (!ignore) {
          setSuggestions(data);
        }
      } catch (err: unknown) {
        console.error(err);
        if (!ignore) {
          setSuggestions([]);
        }
      }
    };

    findSuggestions();

    // Cleanup function to prevent race conditions
    return () => {
      ignore = true;
    };
  }, [typedWord]);

  // Let user to move up and down in product suggestions list
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      if (suggestions.length === 0) return;

      e.preventDefault();

      // Calculate next index
      const nextIndex =
        currentIndex < suggestions.length - 1 ? currentIndex + 1 : -1;

      // Next index reflected in next rendering
      setCurrentIndex(nextIndex);

      if (nextIndex === -1) {
        setSearchWord(typedWord);
      } else {
        setSearchWord(suggestions[nextIndex].searchKeyword);
      }
    } else if (e.key === "ArrowUp") {
      if (suggestions.length === 0) return;

      e.preventDefault();

      // Calculate next index
      const nextIndex =
        currentIndex === -1
          ? suggestions.length - 1
          : currentIndex === 0
            ? -1
            : currentIndex - 1;

      setCurrentIndex(nextIndex);

      if (nextIndex === -1) {
        setSearchWord(typedWord);
      } else {
        setSearchWord(suggestions[nextIndex].searchKeyword);
      }
    }
  };

  const navigateToSearch = (word: string) => {
    // Search word exists?
    const trimmedSearchWord = word.trim();

    // N:
    if (!trimmedSearchWord) return;

    setSuggestions([]);
    setIsSuggestionOpen(false);
    setCurrentIndex(-1);

    // Navigate to search results page
    router.push(`/search?q=${encodeURIComponent(trimmedSearchWord)}`);
  };
  return (
    <form
      className={styles.searchContainer}
      onSubmit={(e) => {
        e.preventDefault();
        navigateToSearch(searchWord);
      }}
    >
      <div className={styles.searchInputWrapper}>
        <input
          type='text'
          aria-label='Search products'
          placeholder='Search Fresh Cart'
          className={styles.searchInput}
          value={searchWord}
          onChange={(e) => {
            const value = e.target.value;
            setSearchWord(value);
            setTypedWord(value);
            setCurrentIndex(-1);
            setIsSuggestionOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />
        {isSuggestionOpen && suggestions.length > 0 && (
          <ul className={styles.suggestionList}>
            {suggestions.map((suggestion) => {
              const suggestedWord = suggestion.searchKeyword;

              return (
                <li key={suggestion.searchKeyword}>
                  <button
                    type='button'
                    className={styles.suggestedWordButton}
                    onClick={() => {
                      setSearchWord(suggestedWord);
                      navigateToSearch(suggestedWord);
                    }}
                  >
                    {suggestedWord}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {searchWord && (
          <button
            onClick={() => {
              setSearchWord("");
              setTypedWord("");
              setSuggestions([]);
              setIsSuggestionOpen(false);
              setCurrentIndex(-1);
            }}
            type='button'
            className={styles.clearButton}
            aria-label='Clear search'
          >
            <X aria-hidden='true' />
          </button>
        )}
      </div>

      <button type='submit' className={styles.searchButton} aria-label='Search'>
        🔍
      </button>
    </form>
  );
}
