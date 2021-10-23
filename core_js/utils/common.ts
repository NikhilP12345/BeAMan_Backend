export const isUndefined = (str: any, emptyStringCheck?: boolean) => {
  if (
    typeof str === 'undefined' ||
    str === null ||
    str === 'undefined' ||
    str === 'null'
  ) {
    return true;
  }
  if (
    emptyStringCheck &&
    typeof str === 'string' &&
    str.toString().trim().length === 0
  ) {
    return true;
  }
  return false;
};

export const isTypeString = (val: any) => {
  return toString.call(val) === '[object String]' ? true : false;
};

export const isTypeNumber = (val: any) => {
  return toString.call(val) === '[object Number]' ? true : false;
};

export const isTypeBoolean = (val: any) => {
  return toString.call(val) === '[object Boolean]' ? true : false;
};

export const isTypeObject = (val: any) => {
  return toString.call(val) === '[object Object]' ? true : false;
};

export const isTypeArray = (val: any) => {
  return toString.call(val) === '[object Array]' ? true : false;
};

export const isTypeFunction = (val: any) => {
  return toString.call(val) === '[object Function]' ? true : false;
};
