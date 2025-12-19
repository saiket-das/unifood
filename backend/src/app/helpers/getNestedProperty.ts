/**
 * Helper function to get nested property from object
 * @param obj - The object to get the property from
 * @param path - Dot-separated path (e.g., 'query.branchId', 'body.data.id')
 * @returns The value at the specified path, or undefined if not found
 */
export const getNestedProperty = (obj: any, path: string): any => {
  return path.split(".").reduce((current, prop) => current?.[prop], obj);
};
