import { Module, Global } from '@nestjs/common';
import { StorageService } from './services/storage.service';
import { CloudinaryProvider } from './providers/cloudinary.provider';

@Global()
@Module({
  providers: [CloudinaryProvider, StorageService],
  exports: [CloudinaryProvider, StorageService],
})
export class CommonModule {}
