import { mergeMapNum } from '@/utils/object-utils';

export const getChainId = (itemId, dedicatedMap, produceMap) => {
  let itemChains = produceMap.get(itemId);
  if (!dedicatedMap.get(itemId) && itemChains?.length !== 1) {
    return false;
  }

  return dedicatedMap.get(itemId) || itemChains[0];
};

export const multiplyCount = (array, size) => array.map(([id, count]) => [id, count * size]);

export const filterZero = ([id, count]) => count > 0;

export const isLeafItem = (id, resources, itemMap) =>
  itemMap.get(id)?.categories?.includes('Natural Resource') || resources.includes(id);

export const addToMap = (array, map) => {
  array.forEach(([id, count]) => {
    const prev = map.get(id) ?? 0;
    const next = count + prev;
    map.set(id, next);
  });
};

export const getSelfConsumeMap = (recipe, output) => {
  const recipeMap = new Map(recipe);
  const map = new Map();
  [...output].forEach(([id, count]) => {
    const selfConsumeNum = Math.min(recipeMap.get(id) ?? 0, count);
    if (selfConsumeNum > 0) mergeMapNum([[id, selfConsumeNum]], map);
  });

  return map;
};
