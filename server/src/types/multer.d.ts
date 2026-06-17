declare namespace Express {
  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    }
  }

  interface Request {
    file?: Multer.File;
    files?: Multer.File[] | Record<string, Multer.File[]>;
  }
}

declare module "multer" {
  import type { RequestHandler } from "express";

  interface Options {
    storage?: unknown;
    limits?: {
      fileSize?: number;
    };
    fileFilter?: (req: Express.Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile?: boolean) => void) => void;
  }

  interface Multer {
    single(fieldName: string): RequestHandler;
  }

  function multer(options?: Options): Multer;

  namespace multer {
    function memoryStorage(): unknown;
  }

  export default multer;
}
