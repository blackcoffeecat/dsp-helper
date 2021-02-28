export const on = (target, type, handler, options) => {
  target.addEventListener(type, handler, options);
};

export const off = (target, type, handler, options) => {
  target.removeEventListener(type, handler, options);
};
