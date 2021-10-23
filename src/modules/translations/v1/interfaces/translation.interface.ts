export interface INamespace{
    name: string;
    active: boolean;
    created_at: number;
    updated_at:number;
}

export interface ITranslationKey{
    name: string;
    namespace: string;
    created_at: number;
    updated_at:number;
}

export interface ITranslationText{
    key: string,
    text: string;
    language: string;
    created_at: number;
    updated_at:number;
}

export type ITranslationsResponse = Record<string, Record<string,string>>
export type ITranslationsAppResponse = Record<string, Record<string, Record<string,string>>>

export interface ICsvFileStructure {
    [key:string]: string
}