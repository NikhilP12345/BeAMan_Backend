import { HttpException } from "@nestjs/common";

export default class LtException extends HttpException {
    statusCode: number;
    code: number;

    constructor(config, statusCode, message = '') {
        super(config, statusCode);
        this.statusCode = config.statusCode
        this.code = config.code;
        this.message = message || config.message;
    }
}