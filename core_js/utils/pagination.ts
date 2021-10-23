import { PaginatedResultDto } from "@core/dto/pagination";
import { Document, Query } from "mongoose";


export const getPaginatedResults = async <T extends Document>(query: Query<T[], T>, page = 1, size = 10): Promise<PaginatedResultDto<T>> => {

    const result: PaginatedResultDto<T> = {
        data: [],
        hasPrevious: false,
        hasNext: false
    };

    const skip = page > 1 ? (page - 2) * size : 0;
    const limit = page > 1 ? 2 * size + 1 : size + 1;
    let data = await query.skip(skip).limit(limit).exec();

    if ( page == 1 ) {
        if (data.length > size) {
            result.hasNext = true;
            data.pop();
        } else {
            result.hasNext = false;
        }
        result.data = data;
    } else {
        const length = data.length;

        if ( length !== 0) {
            result.hasPrevious = true;

            if (length > 2*size) {
                result.hasNext = true;
                data.splice(0, size)
                data.pop();
            } else if (data.length > size) {
                result.hasNext = false;
                data.splice(0, size);
            } else {
                data = [];
            }
            result.data = data;
        }
    }

    return result;
}