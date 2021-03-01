import Big from 'big.js';

export const mergeMapNum = (array, map, rate = 1) => {
  [...array].forEach(([key, num]) => {
    const curr = map.get(key) ?? 0;
    let next = new Big(num); // curr + num * rate;
    next = next.times(rate);
    next = next.plus(curr);
    map.set(key, next.toNumber());
  });

  return map;
};

export const parseNum = num => Math.ceil(round(num) * 1e4) / 1e4;

export const round = (num, radix = 6) => {
  const r = 10 ** radix;
  return Math.round(num * r) / r;
};

export const numReadable = (() => {
  const units = ['', 'K', 'M', 'G', 'T', 'P'];
  const fn = (num, unit = 0) => {
    if (num >= 1e3) return fn(num / 1e3, unit + 1);
    return `${parseNum(num)}${units[unit]}`;
  };
  return fn;
})();
