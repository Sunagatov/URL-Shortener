import {
  filterMappings,
  getClientPageMappings,
  getClientTotalPages,
  getNextServerPageAfterDelete,
  getVisibleMappings,
  sortMappings,
} from '@/features/urls/lib/urlMappingsCollection';

const mappings = [
  {
    urlHash: 'older',
    originalUrl: 'https://example.com/alpha',
    shortUrl: 'https://sho.rt/older',
    clickCount: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    expirationDate: '2024-03-01T00:00:00.000Z',
  },
  {
    urlHash: 'newer',
    originalUrl: 'https://openai.com/beta',
    shortUrl: 'https://sho.rt/newer',
    clickCount: 5,
    createdAt: '2024-02-01T00:00:00.000Z',
    expirationDate: '2024-04-01T00:00:00.000Z',
  },
] as const;

describe('urlMappingsCollection helpers', () => {
  it('sorts by newest and oldest', () => {
    expect(sortMappings([...mappings], 'newest').map((mapping) => mapping.urlHash)).toEqual([
      'newer',
      'older',
    ]);
    expect(sortMappings([...mappings], 'oldest').map((mapping) => mapping.urlHash)).toEqual([
      'older',
      'newer',
    ]);
  });

  it('filters by original and short URLs', () => {
    expect(filterMappings([...mappings], 'openai').map((mapping) => mapping.urlHash)).toEqual([
      'newer',
    ]);
    expect(filterMappings([...mappings], 'sho.rt/older').map((mapping) => mapping.urlHash)).toEqual([
      'older',
    ]);
  });

  it('returns filtered and sorted mappings together', () => {
    expect(getVisibleMappings([...mappings], 'https://sho.rt', 'oldest')).toEqual(mappings);
  });

  it('returns client page slices using the shared page size', () => {
    const manyMappings = Array.from({ length: 8 }, (_, index) => ({
      ...mappings[0],
      urlHash: `hash-${index}`,
      shortUrl: `https://sho.rt/hash-${index}`,
    }));

    expect(getClientPageMappings(manyMappings, 0)).toHaveLength(6);
    expect(getClientPageMappings(manyMappings, 1)).toHaveLength(2);
    expect(getClientTotalPages(manyMappings.length)).toBe(2);
  });

  it('backs up one server page when deleting the last item on a later page', () => {
    expect(
      getNextServerPageAfterDelete({
        currentPageSize: 1,
        deletedCount: 1,
        serverPage: 2,
      }),
    ).toBe(1);

    expect(
      getNextServerPageAfterDelete({
        currentPageSize: 3,
        deletedCount: 1,
        serverPage: 2,
      }),
    ).toBe(2);
  });
});
