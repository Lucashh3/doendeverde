import { useEffect, useRef, useState } from 'react';

export type TagSuggestion = {
  slug: string;
  label: string;
  usage_count: number;
  score: number;
};

type UseTagSuggestionsOptions = {
  limit?: number;
  enabled?: boolean;
  debounceMs?: number;
};

const DEFAULT_OPTIONS: Required<UseTagSuggestionsOptions> = {
  limit: 8,
  enabled: true,
  debounceMs: 200
};

export function useTagSuggestions(
  query: string,
  options: UseTagSuggestionsOptions = {}
): {
  suggestions: TagSuggestion[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const { limit, enabled, debounceMs } = { ...DEFAULT_OPTIONS, ...options };
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryRef = useRef(query);
  const controllerRef = useRef<AbortController | null>(null);
  const shouldRefetchRef = useRef(false);

  const fetchSuggestions = (term: string) => {
    if (!enabled) {
      setSuggestions([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (term) {
      params.set('q', term);
    }
    params.set('limit', String(limit));

    fetch(`/api/tags/search?${params.toString()}`, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) {
          throw new Error('Falha ao buscar sugestões de tags');
        }
        const data: { tags: TagSuggestion[] } = await response.json();
        setSuggestions(data.tags ?? []);
      })
      .catch(fetchError => {
        if (fetchError.name === 'AbortError') {
          return;
        }
        console.error('[useTagSuggestions] fetch error', fetchError);
        setError(fetchError instanceof Error ? fetchError.message : 'Erro desconhecido ao buscar tags');
      })
      .finally(() => {
        if (controllerRef.current === controller) {
          setIsLoading(false);
          controllerRef.current = null;
        }
      });
  };

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (queryRef.current !== query || shouldRefetchRef.current) {
      queryRef.current = query;
      shouldRefetchRef.current = false;

      const timer = setTimeout(() => {
        fetchSuggestions(query.trim());
      }, debounceMs);

      return () => {
        clearTimeout(timer);
      };
    }

    // initial load
    fetchSuggestions(query.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, enabled, debounceMs]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  return {
    suggestions,
    isLoading,
    error,
    refetch: () => {
      shouldRefetchRef.current = true;
      fetchSuggestions(queryRef.current.trim());
    }
  };
}
