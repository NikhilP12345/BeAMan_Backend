import { isTypeNumber, isTypeString, isUndefined } from './common';
import { isStringValidNumber } from './string';

export const isNumberInt = (n) => {
  return n % 1 === 0;
};

export const getValidNumber = (val) => {
  if (isUndefined(val)) {
    return null;
  }

  if (isTypeNumber(val)) {
    return val;
  } else if (isTypeString(val) && isStringValidNumber(val)) {
    return Number(val);
  } else {
    return null;
  }
};

export const getValidInt = (val) => {
  val = getValidNumber(val);
  if (!isUndefined(val)) {
    return parseInt(val);
  } else {
    return null;
  }
};
