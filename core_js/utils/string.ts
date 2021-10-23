import { isTypeNumber, isTypeString, isUndefined } from './common';

export const isStringValidNumber = (val) => {
  if (isTypeString(val)) {
    var num = Number(val.trim());
    if (isNaN(num)) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
};

export const getValidStr = (val) => {
  if (!isUndefined(val) && isTypeString(val)) {
    return val.trim();
  } else if (isTypeNumber(val)) {
    return val.toString().trim();
  } else {
    return null;
  }
};
