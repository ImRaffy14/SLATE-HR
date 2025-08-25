export const searchItems = <T>(
  items: T[],
  searchTerm: string,
  searchKeys: (keyof T)[]
): T[] => {
  if (!searchTerm) return items;
  
  const lowercasedTerm = searchTerm.toLowerCase();
  
  return items.filter((item) =>
    searchKeys.some((key) => {
      const value = item[key];
      return String(value).toLowerCase().includes(lowercasedTerm);
    })
  );
};


export const filterItems = <T>(
  items: T[],
  filterKey: keyof T,
  filterValue: string | string[],
  allOptionValue: string = "All"
): T[] => {
  if (filterValue === allOptionValue || !filterValue) return items;
  
  if (Array.isArray(filterValue)) {
    return items.filter((item) => filterValue.includes(String(item[filterKey])));
  }
  
  return items.filter((item) => String(item[filterKey]) === filterValue);
};


export const paginateItems = <T>(items: T[], currentPage: number, itemsPerPage: number): T[] => {
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  return items.slice(indexOfFirstItem, indexOfLastItem);
};

export const processItems = <T>(
  items: T[],
  options: {
    searchTerm?: string;
    searchKeys?: (keyof T)[];
    filterKey?: keyof T;
    filterValue?: string | string[];
    allOptionValue?: string;
    currentPage: number;
    itemsPerPage: number;
  }
): {
  processedItems: T[];
  totalItems: number;
  totalPages: number;
} => {

  let result: T[] = [...items];

  if (options.searchTerm && options.searchKeys && options.searchKeys.length > 0) {
    result = searchItems<T>(result, options.searchTerm, options.searchKeys);
  }

  if (options.filterKey && options.filterValue != null) {
    result = filterItems(
      result,
      options.filterKey,
      options.filterValue,
      options.allOptionValue
    );
  }

  const totalItems = result.length;
  const totalPages = Math.ceil(totalItems / options.itemsPerPage);

  result = paginateItems(result, options.currentPage, options.itemsPerPage);

  return {
    processedItems: result,
    totalItems,
    totalPages,
  };
};

