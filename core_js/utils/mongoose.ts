import { Aggregate, Document, Query } from "mongoose";


/**
 * utility method to scroll through the documents of a collection using pagination
 * @param {Query} query
 * @param {Function} callback to be executed for each document
 * @param {number} pageSize Page size for scrolling, default = 100
 * @returns Promise<void>
 */
export const scrollCollection = async <T extends Document>(query: Query<T[], T>, callback: (doc: T[]) => Promise<void>, pageSize: number = 100) => {
    let skip = 0;

    while (true) {
        const docs = await query.model.find({}).merge(query).skip(skip*pageSize).limit(pageSize + 1).exec();
        const count = docs.length;

        if (count == 0) {
            return
        }

        docs.pop();
        await callback(docs);

        if (count == pageSize) {
            break;
        }

        skip += 1;
    }

}

export const scrollCollectionAggregate = async <T extends Document>(aggregation: Aggregate<any>, callback: (doc: T[]) => Promise<void>, pageSize: number = 100) => {
    let page = 0;

    while (true) {
        const docs = await aggregation.skip(page*pageSize).limit(pageSize + 1).exec();
        const count = docs.length;

        if (count == 0) {
            return
        }

        docs.pop();
        await callback(docs);

        if (count == pageSize) {
            break;
        }

        page += 1;
    }
    // 

}