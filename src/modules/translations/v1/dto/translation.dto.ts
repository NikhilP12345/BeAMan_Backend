import { APP_DATA } from "@constants";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Type, Transform } from 'class-transformer';
import { ITranslationsResponse } from "../interfaces/translation.interface";
import { PaginationDto } from "@core/dto/pagination";
import { Languages } from "@modules/translations/enums/languages";

export class CsvToObjectDto{
    name: string;
}
export class NamespaceDto{
    @IsString()
    @IsNotEmpty()
    @Transform((value)=> value.toString())
    name: string
}

export class TranslationsUploadDto {
    @IsString()
    @IsNotEmpty()
    namespace: string
}

export class TranslationsDownloadDto {
    @IsString()
    @IsOptional()
    namespace?: string
}


export class TranslationQueryDto extends PaginationDto {

    @IsString()
    namespace:string = APP_DATA.DEFAULT_NAMESPACE;

    @IsOptional()
    @IsString()
    query?: string;
    
}

export class TranslationResponseDto {
    [key:string]: string;
    prev: string;
    next: string;
}

export class TranslationTextDto {

    @IsNotEmpty()
    @IsString()
    key:string;

    @IsNotEmpty()
    @IsString()
    text: string;

    @IsNotEmpty()
    @IsString()
    language: string;
}

export class TranslationForAppQuery {
    @IsNotEmpty()
    @IsArray()
    @IsString({each:true})
    namespaces: string[];

    @IsString()
    language:string = APP_DATA.DEFAULT_LANGUAGE;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    last_fetched_timestamp?:number
}

export class TranslationsResponseDto {
    data: ITranslationsResponse;
    next:boolean;
}


export class TranslationAggregateItem {
    _id: string;

    translations: Array<{
        lang: Languages;
        text: string;
    }>
}

