import useCall, { useCallArgs } from '@/hooks/useCall';
import useConstants from '@/hooks/useConstants';
import useJson from '@/hooks/useJson';
import useOnChange from '@/hooks/useOnChange';
import useShallowMemo from '@/hooks/useShallowMemo';
import useSimpleMemo from '@/hooks/useSimpleMemo';
import { useDebugValue, useEffect, useLayoutEffect, useMemo, useState } from 'react';

function useProductionState(solution) {
  const items = useJson('data/items.json');
  const chains = useJson('data/production-chains.json');

  const itemMap = useMemo(() => {
    const map = new Map();
    items?.forEach(item => {
      map.set(item.id, item);
    });

    return map;
  }, [items]);

  const [chainMap, consumeMap, produceMap] = useMemo(() => {
    const chainMap = new Map();
    const consumeMap = new Map();
    const produceMap = new Map();
    chains?.forEach(chain => {
      const { id, output, recipe } = chain;

      // deduplicate chains by empty building
      // because some of chain data were grabbed from Wiki page's .item_panel element
      // that has no building info.
      // for those items which #product-chains section is empty needs this chain data.
      if (!chainMap.get(id)?.building?.length) chainMap.set(id, chain);

      output.forEach(([itemId]) => {
        const list = [...new Set((produceMap.get(itemId) ?? []).concat([id]))];
        produceMap.set(itemId, list);
      });

      recipe.forEach(([itemId]) => {
        const list = [...new Set((consumeMap.get(itemId) ?? []).concat([id]))];
        consumeMap.set(itemId, list);
      });
    });
    return [chainMap, consumeMap, produceMap];
  }, [chains]);

  const context = useShallowMemo({
    items,
    chains,
    itemMap,
    chainMap,
    consumeMap,
    produceMap,
  });

  // Producing Item
  const [produceItem, setProduceItem] = useState(null);

  // Item Producing Speed
  const [produceSpeed, changeProduceSpeed, setProduceSpeed] = useOnChange(1);
  const [speedUnit, changeSpeedUnit, setSpeedUnit] = useOnChange('/s');
  const speed = Math.abs(produceSpeed || 1) / ({ '/m': 60 }[speedUnit] ?? 1);

  // Choose Chain
  const [alternateRecipes, setAlternateRecipes] = useState([]);
  const addItemRecipe = useCall((item, chain) => {
    item = item?.id ?? item;
    chain = chain?.id ?? chain;
    setAlternateRecipes(pairs => [...new Map(pairs).set(item, chain)]);
  });
  const removeItemRecipe = useCall(item => {
    item = item?.id ?? item;
    setAlternateRecipes(pairs => {
      const map = new Map(pairs);
      map.delete(item);
      return [...map];
    });
  });
  const resetAlternateRecipes = useCallArgs(setAlternateRecipes, []);

  // Choose Machine
  const [assemblers, setAssemblers] = useState([]);
  const addAssembler = useCall(item => {
    item = item?.id ?? item;
    setAssemblers(machines => [...new Set(machines).add(item)]);
  });
  const removeAssembler = useCall(item => {
    item = item?.id ?? item;
    setAssemblers(machines => machines.filter(v => v !== item));
  });
  const resetAssemblers = useCallArgs(setAssemblers, []);

  // Source Items
  const [resources, setResources] = useState([]);
  const addToResource = useCall(item => {
    item = item?.id ?? item;
    setResources(list => [...new Set(list).add(item)]);
  });
  const removeResource = useCall(item => {
    item = item?.id ?? item;
    setResources(list => {
      const set = new Set(list);
      set.delete(item);
      return [...set];
    });
  });
  const resetResources = useCallArgs(setResources, []);

  const state = useShallowMemo({
    produceItem,
    produceSpeed,
    speedUnit,
    resources,
    alternateRecipes,
    assemblers,
  });

  // Calculate Assembly Lines
  const [productionChains, extraResources] = useMemo(() => {
    console.log(produceItem, speed, state, context);
    if (!items?.length || !chains?.length || !produceItem) return [null, null];

    const result = solution(produceItem, speed, state, context);
    console.log(...result);
    return result;
  }, [produceItem, speed, items, chains, state]);

  useLayoutEffect(() => {
    if (extraResources?.length) {
      setTimeout(() => {
        setResources(list => [...new Set([...list, ...extraResources])]);
      });
    }
  }, [extraResources]);

  const result = useSimpleMemo({
    productionChains,
  });

  const actions = useConstants({
    setProduceItem,

    changeProduceSpeed,
    setProduceSpeed,

    changeSpeedUnit,
    setSpeedUnit,

    setAlternateRecipes,
    addItemRecipe,
    removeItemRecipe,
    resetAlternateRecipes,

    setResources,
    addToResource,
    removeResource,
    resetResources,

    setAssemblers,
    addAssembler,
    removeAssembler,
    resetAssemblers,
  });

  const appState = useShallowMemo({
    context,
    state,
    actions,
    result,
  });

  useDebugValue(context);
  useDebugValue(actions);
  useDebugValue(state);
  useDebugValue(result);

  return appState;
}

export default useProductionState;
