import { RowTransformFunction } from "@fast-csv/format";
import { ParserRowValidate } from "fast-csv";

export type CsvParserOptions<R = any, T = R> = {
    transform?: RowTransformFunction<R, T>,
    validate?: ParserRowValidate<T>
}