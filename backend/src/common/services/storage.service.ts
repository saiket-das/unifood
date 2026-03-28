import { Injectable, Inject, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
const streamifier = require('streamifier');

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(@Inject('CLOUDINARY') private cloudinaryConfig: any) {
    this.logger.log('StorageService initialized with Cloudinary config');
  }

  uploadFile(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream((error, result) => {
        if (error) {
          this.logger.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve(result);
      });

      if (!file.buffer) {
        this.logger.error('File buffer is missing');
        return reject(new Error('File buffer is missing'));
      }

      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }
}
