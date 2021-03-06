import { getChainId, getSelfConsumeMap, isLeafItem } from '@/app/solutions/shared';
import { mergeMapNum, round } from '@/utils/object-utils';

const itemCollectSolution = (item, speed, state, context) => {
  const { resources, alternateRecipes, assemblers } = state;
  const { items, chains, itemMap, chainMap, consumeMap, produceMap } = context;

  let next = new Map([[item.id, speed]]);
  const indicated = new Set();

  const dedicatedMap = new Map(alternateRecipes);

  const assemblyChainMap = new Map();
  const assemblyInfoMap = new Map();

  const extraResources = new Map();

  while (next.size) {
    const itemList = [...next];
    next = new Map();

    for (const [itemId, consumption] of itemList) {
      const chainId = getChainId(itemId, dedicatedMap, produceMap);

      if (!chainId) {
        mergeMapNum([[itemId, consumption]], extraResources);
        continue;
      }

      const assemblyChainId = `${itemId}::${chainId}`;

      if (!assemblyInfoMap.has(assemblyChainId)) {
        const chain = chainMap.get(chainId);
        let { recipe, output, duration, building } = chain;

        if (building?.length === 1) {
          building = building[0];
        } else if (building?.length > 1) {
          building = building.find(v => assemblers.includes(v)) ?? building[0];
        }

        if (building) {
          duration = duration / (itemMap.get(building)?.produceSpeed ?? 1);
        }

        if (duration === 0) {
          mergeMapNum([[itemId, consumption]], extraResources);
          continue;
        }

        let recMap = new Map(recipe);
        let outMap = new Map(output);

        const selfConsumed = getSelfConsumeMap(recMap, outMap);
        recMap = mergeMapNum(selfConsumed, recMap, -1);
        outMap = mergeMapNum(selfConsumed, outMap, 1);

        recMap = mergeMapNum(recipe, new Map(), 1 / duration);
        outMap = mergeMapNum(outMap, new Map(), 1 / duration);

        const itemRate = outMap.get(itemId);
        outMap.delete(itemId);

        assemblyInfoMap.set(assemblyChainId, {
          assemblyChainId,
          chainId,
          itemId,
          itemRate,
          recipe: [...recMap],
          building,
        });
      }

      const { itemRate, recipe } = assemblyInfoMap.get(assemblyChainId);

      const chainSize = round(consumption / itemRate);
      mergeMapNum([[assemblyChainId, chainSize]], assemblyChainMap);

      recipe.forEach(([id, count]) => {
        if (
          id !== itemId &&
          !isLeafItem(id, resources.concat([...extraResources.keys()]), itemMap)
        ) {
          mergeMapNum([[id, count]], next, chainSize);
        }
      });
    }
  }

  const assemblyChains = [...assemblyChainMap].reduce((ret, [id, chainSize]) => {
    const info = assemblyInfoMap.get(id);
    info.chainSize = Math.max(1, Math.ceil(chainSize));
    return [info, ...ret];
  }, []);

  return [assemblyChains, [...extraResources.keys()]];
};

export default itemCollectSolution;
