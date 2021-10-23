import { CsvParserStream } from '@fast-csv/parse';
import { parseString, ParserOptionsArgs } from 'fast-csv'
import { CsvParserOptions } from './typings';

export const parse = <R = any, T = R>(stream: CsvParserStream<R, T>, parserOptions?: CsvParserOptions<R, T>): Promise<T[]> => {

    return new Promise((resolve, reject) => {

        const data: T[] = [];

        if (parserOptions && parserOptions.transform) {
            stream.transform(parserOptions.transform);
        }

        if (parserOptions && parserOptions.validate) {
            stream.validate(parserOptions.validate)
            stream.on('data-invalid', (row: T, rowNumber: number) => {
                reject({
                    row,
                    rowNumber
                })
            })
        }

        stream.on('error', reject);
        stream.on('data', (row: T) => {
            data.push(row)
        })
        stream.on('end', () => {
            resolve(data);
        })
    });
}

export const parseCsvBuffer = async <R = any, T = any>(file: Express.Multer.File, options?: ParserOptionsArgs, parserOptions?: CsvParserOptions<R, T>): Promise<T[]> => {
    const str = file.buffer.toString();
    return await parse(parseString(str, options), parserOptions);
}