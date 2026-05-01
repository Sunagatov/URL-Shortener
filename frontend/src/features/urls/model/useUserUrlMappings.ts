import {
  useUrlMappingsCollection,
} from '@/features/urls/model/useUrlMappingsCollection';
import { useUrlMappingsSelection } from '@/features/urls/model/useUrlMappingsSelection';

export const useUserUrlMappings = () => {
  const collection = useUrlMappingsCollection();
  const selection = useUrlMappingsSelection(collection.displayMappings);

  const handleBulkDelete = async () => {
    selection.setIsBulkDeleting(true);

    try {
      const deleted = await collection.handleBulkDelete([...selection.selectedHashes]);

      if (deleted) {
        selection.clearSelection();
      }

      return deleted;
    } finally {
      selection.setIsBulkDeleting(false);
    }
  };

  return {
    ...collection,
    ...selection,
    handleBulkDelete,
  };
};
