import { ErrorType, Errors } from ".";
import LtException from "./lt_exception";

export const createError = (
    errorType: ErrorType,
    message?: string
): Error => {
    const err = Errors[errorType];

    return new LtException(err, err.statusCode, message);

}