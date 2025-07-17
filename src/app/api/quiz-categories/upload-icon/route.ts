// @ts-ignore: Could not find module 'cloudinary' types
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    // Debug: Log presence of env vars
    console.log('Cloudinary ENV:', {
      CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
    });
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'quiz-category-icons' },
        (error: Error | undefined, result: UploadApiResponse | undefined) => {
          if (error || !result) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Return the Cloudinary URL
    return NextResponse.json({ success: true, imageUrl: uploadResult.secure_url });
  } catch (error: any) {
    console.error('Category icon upload error:', error, error?.message, error?.stack);
    return NextResponse.json({ error: error?.message || 'Failed to upload icon', stack: error?.stack }, { status: 500 });
  }
} 