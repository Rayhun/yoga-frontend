export const reorderList = (list, fromIndex, toIndex) => {
  if (fromIndex === toIndex) return list;

  const result = [...list];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
};
