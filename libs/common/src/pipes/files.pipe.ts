import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import * as path from 'path';

const MAGIC_BYTES: Record<string, number[]> = {
  '.jpg': [0xff, 0xd8, 0xff],
  '.jpeg': [0xff, 0xd8, 0xff],
  '.png': [0x89, 0x50, 0x4e, 0x47],
  //   '.pdf': [0x25, 0x50, 0x44, 0x46],
};

interface FileValidationPipeOptions {
  allowedFileTypes: string[];
  maxSize: number;
  filesLimit?: number;
}

@Injectable()
export class FilesValidationPipe implements PipeTransform {
  private readonly allowedFileTypes: string[];
  private readonly maxSize: number;
  private readonly filesLimit: number;

  constructor(options: FileValidationPipeOptions) {
    this.allowedFileTypes = options.allowedFileTypes;
    this.maxSize = options.maxSize;
    this.filesLimit = options.filesLimit ?? 1;
  }

  transform(files: Express.Multer.File | Express.Multer.File[]) {
    if (!files) {
      throw new BadRequestException('File is required');
    }

    if (Array.isArray(files) && files.length > this.filesLimit) {
      throw new BadRequestException(
        `number of files must be less then ${this.filesLimit}`,
      );
    }

    const filesToValidate = Array.isArray(files) ? files : [files];

    filesToValidate.forEach((file) => {
      const ext = path.extname(file.originalname).toLowerCase();

      if (!this.allowedFileTypes.includes(ext)) {
        throw new BadRequestException('invalid file type');
      }

      const signature = MAGIC_BYTES[ext];

      if (signature) {
        const fileHeader = Array.from(file.buffer.slice(0, signature.length));

        const isValidSignature = signature.every(
          (byte, index) => fileHeader[index] === byte,
        );

        if (!isValidSignature) {
          throw new BadRequestException(
            `file content does not match extension: ${ext}`,
          );
        }
      }

      if (file.size > this.maxSize) {
        throw new BadRequestException(
          `file size exceeds limit (${this.maxSize} bytes)`,
        );
      }
    });

    return files;
  }
}
