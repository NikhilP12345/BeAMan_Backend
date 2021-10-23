import { IsNumber, IsOptional } from "class-validator";
import { Type } from 'class-transformer';

export class PaginationDto {
    
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    page: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    size:number;

}

export class PaginatedResultDto<T> {
    data: T[]

    @IsOptional()
    hasNext?: boolean

    @IsOptional()
    hasPrevious?: boolean
}