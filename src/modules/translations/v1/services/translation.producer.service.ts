import { TASKS } from '@constants';
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class TranslationProducerService{
  constructor(
    @Inject(TASKS.service.TRANSLATION_SERVICE) private readonly client: ClientProxy,
  ) {}

    produceEvent(pattern: string, data: any) {
        try{
            console.log("hello")
            return this.client.emit(pattern, data)
        }catch(error){
            throw new Error('Unable to emit the event')
        }
    }

    produceMessage(pattern: string, data: any){
        try{
            return this.client.send(pattern, data).toPromise();
        }catch(error){
            throw new Error('Unable to send the message')
        }
    }

    async produceArrayOfEvents(pattern: string, data: any){
        try{
            const pendingOperation: any[] = data.map(el => {
                return this.produceEvent(pattern, el)
            })
            return Promise.all(pendingOperation)
        }catch(error){
            throw new Error('Unable to emit the event')
        }

    }
    
}