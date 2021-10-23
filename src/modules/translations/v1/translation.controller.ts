import { APP_DATA } from "@constants";
import PaginatedResponseInterceptor from "@core/interceptors/paginatedRespone";
import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors, Req, Body, Get, Query, HttpCode, HttpException, HttpStatus, Res, Header } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { NamespaceDto, TranslationForAppQuery, TranslationQueryDto, TranslationResponseDto, TranslationsDownloadDto, TranslationsUploadDto } from "../v1/dto/translation.dto";
import { ITranslationsAppResponse } from "./interfaces/translation.interface";
import { NamespaceService } from "./services/namespace.service";
import { TranslationService } from "./services/translation.service";


@Controller({
    version: '1',
    path: 'translations'
})
export class TranslationController{
    constructor(
        private readonly translationService: TranslationService,
        private readonly namespaceService: NamespaceService

    ){}


    @Post('/namespace')
    async createNamespace(@Body() body: NamespaceDto) {
        if (!body.name) {
            throw new BadRequestException('Parameter Namespace not defined')
        }

        const namespace = await this.namespaceService.createNamespace(body.name);
        return namespace
    }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    @HttpCode(200)
    async creatingTranslations(@UploadedFile() file: Express.Multer.File, @Body() body: TranslationsUploadDto){

        if (!file) {
            throw new BadRequestException('File not present')
        }
        
        await this.translationService.uploadTranslationsCsv(file, body.namespace)
        return {'message': 'successfully uploaded'};
        
    }

    /**
     * Fetches translation data for the namespaces or key with pagination applied
     * @param {transaltionQueryDto} transaltionQueryDto 
     */

    @Get('dashboard')
    @UseInterceptors(PaginatedResponseInterceptor)
    async getTranslations(@Query() translationQuery: TranslationQueryDto) {
        try {
            return await this.translationService.searchAllTranslationsInNamespace(translationQuery)
        } catch(err) {
            throw err;
        }
    }

    @Get()
    async getTranslationsForApp(@Res({passthrough: true}) res:Response, @Query() param: TranslationForAppQuery):Promise<ITranslationsAppResponse> {
        try {
            const response:ITranslationsAppResponse = await this.translationService.getTranslationsForApp(param);
            if(!response) res.status(HttpStatus.NOT_MODIFIED)
            return response
        } catch(err) {
            throw err
        }
    }

    @Get('/download')
    @Header('Content-Type', 'text/csv')
    @Header('Content-Disposition', `attachment; filename="${APP_DATA.TRANSLATION_FILE_NAME}"`)
    async downloadTranslationsAsCsv(@Query() {namespace}: TranslationsDownloadDto) {

        return await this.translationService.getTranslationsAsCsvString(namespace);

    }




    
}

