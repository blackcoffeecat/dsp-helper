export const mergeMapNum = (array, map, rate = 1) => {
  [...array].forEach(([key, num]) => {
    const curr = map.get(key) ?? 0;
    const next = curr + num * rate;
    map.set(key, next);
  });

  return map;
};

export const parseNum = num => Math.ceil(num * 1e4) / 1e4;

export const numReadable = (() => {
  const units = ['', 'K', 'M', 'G', 'T', 'P'];
  const fn = (num, unit = 0) => {
    if (num >= 1e3) return fn(num / 1e3, unit + 1);
    return `${parseNum(num)}${units[unit]}`;
  };
  return fn;
})();
