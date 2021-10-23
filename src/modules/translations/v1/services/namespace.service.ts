import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Namespace, NamespaceDocument } from "../../schemas/namespace.schema";




@Injectable()
export class NamespaceService{
    constructor(
        @InjectModel(Namespace.name) private namespaceModel:  Model<NamespaceDocument>,
    ){
        this.namespaceModel.syncIndexes();
    }

    /**
     * Get only namespaces which are updatecafter the given timestamp
     * @param {string[]}namespaces 
     * @param {number} timestamp 
     * @returns Namespace[]
     */
    async getUpdatedNamespaces(namespaces: string[], timestamp:number): Promise<Namespace[]> {
        try {
            if(!namespaces && !namespaces.length) throw new Error(`Undefined namespaces`)
            return await this.namespaceModel.find({name: {$in:namespaces}, updated_at:{$gte:timestamp}});
        } catch(err) {
            throw err
        }
    }


    /**
     * Create New Namespace
     * @param {string} name
     * @returns Namespace
     */

    async createNamespace(name: string): Promise<Namespace>{
        const newNamespace = new this.namespaceModel({
            name,
            active: true
        });

        return await newNamespace.save();
    }

    async createOrUpdateNamespace(name: string): Promise<Namespace>{
        const namespace = await this.namespaceModel.findOneAndUpdate({
            name
        },{
            name,
            active: true
        },{
            new: true,
            upsert: true 
        });

        return namespace
    }

}