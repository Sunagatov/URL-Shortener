import { useCallback, useEffect, useMemo, useState } from 'react';
import type { UrlMapping } from '@/features/urls/types/url';

export type SelectionSet = Set<string>;

export function useUrlMappingsSelection(displayMappings: UrlMapping[]) {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedHashes, setSelectedHashes] = useState<SelectionSet>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const visibleHashes = useMemo(
    () => new Set(displayMappings.map((mapping) => mapping.urlHash)),
    [displayMappings],
  );

  useEffect(() => {
    setSelectedHashes((current) => {
      const next = new Set(
        [...current].filter((hash) => visibleHashes.has(hash)),
      );

      return next.size === current.size ? current : next;
    });
  }, [visibleHashes]);

  const toggleSelectMode = useCallback(() => {
    setIsSelectMode((current) => !current);
    setSelectedHashes(new Set());
  }, []);

  const toggleSelect = useCallback((hash: string) => {
    setSelectedHashes((current) => {
      const next = new Set(current);

      if (next.has(hash)) {
        next.delete(hash);
      } else {
        next.add(hash);
      }

      return next;
    });
  }, []);

  const isAllSelected = displayMappings.length > 0 && displayMappings.every((mapping) => selectedHashes.has(mapping.urlHash));

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedHashes(new Set());
      return;
    }

    setSelectedHashes(new Set(displayMappings.map((mapping) => mapping.urlHash)));
  }, [displayMappings, isAllSelected]);

  return {
    clearSelection: () => {
      setSelectedHashes(new Set());
      setIsSelectMode(false);
    },
    isAllSelected,
    isBulkDeleting,
    isSelectMode,
    selectedHashes,
    setIsBulkDeleting,
    toggleSelect,
    toggleSelectAll,
    toggleSelectMode,
  };
}
