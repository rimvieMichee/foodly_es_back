import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  constructor(private cloudinaryService: CloudinaryService) {}

  @Post('test')
  testEndpoint() {
    console.log('🧪 Test endpoint called');
    console.log('Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
      api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing',
    });
    return {
      message: 'Test endpoint working',
      cloudinary: {
        configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
      }
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    console.log('📤 Upload request received at /upload');
    console.log('File:', file ? {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    } : 'No file');

    if (!file) {
      console.error('❌ No file uploaded');
      throw new BadRequestException('No file uploaded');
    }

    // Vérifier le type de fichier
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      console.error('❌ Invalid file type:', file.mimetype);
      throw new BadRequestException('Only image files are allowed (JPEG, PNG, WebP)');
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error('❌ File too large:', file.size);
      throw new BadRequestException('File size must be less than 5MB');
    }

    try {
      console.log('☁️  Uploading to Cloudinary...');
      const result = await this.cloudinaryService.uploadImage(file, 'foodly/announcements');
      console.log('✅ Upload successful:', result.secure_url);
      
      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      console.error('❌ Cloudinary upload error:', error);
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    console.log('📤 Upload request received');
    console.log('File:', file ? {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    } : 'No file');

    if (!file) {
      console.error('❌ No file uploaded');
      throw new BadRequestException('No file uploaded');
    }

    // Vérifier le type de fichier
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      console.error('❌ Invalid file type:', file.mimetype);
      throw new BadRequestException('Only image files are allowed (JPEG, PNG, WebP)');
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error('❌ File too large:', file.size);
      throw new BadRequestException('File size must be less than 5MB');
    }

    try {
      console.log('☁️  Uploading to Cloudinary...');
      const result = await this.cloudinaryService.uploadImage(file, 'foodly/products');
      console.log('✅ Upload successful:', result.secure_url);
      
      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      console.error('❌ Cloudinary upload error:', error);
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }
}
