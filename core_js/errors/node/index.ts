import Errors from '../errors.json';

export type ErrorType = keyof typeof Errors;

export type ErrorConfig = {
    code: number;
    statusCode: number;
    translationKey: string;
    message: string;
    params: any[];
}

export {Errors};
export { createError } from './helper';