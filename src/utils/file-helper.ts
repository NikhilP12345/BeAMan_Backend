// export const csvFileFilter = (req: any, file: any, callback: any) => {
//     if(!file.originalname.match(.+(\.csv)$))
// }

import { ApiBody } from "@nestjs/swagger";
import { Readable } from "stream";

export const bufferToStream = (binary) => {

    const readableInstanceStream = new Readable({
      read() {
        this.push(binary);
        this.push(null);
      }
    });

    return readableInstanceStream;
}

export const uploadFile = (fileName: string = 'file'): MethodDecorator => (
    target: any,
    propertyKey,
    descriptor: PropertyDescriptor,
  ) => {
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fileName]: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })(target, propertyKey, descriptor);
  };