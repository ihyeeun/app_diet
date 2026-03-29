import { useEffect, useState } from "react";

import { SEARCH_DEBOUNCE_MS } from "@/features/search/search.constants";

export function useDebouncedKeyword(keyword: string) {
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [keyword]);

  return debouncedKeyword;
}
