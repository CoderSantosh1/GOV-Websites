import { NextResponse } from 'next/server';
import { connectToDatabase as connectDB } from '@/lib/db';
import Job from '@/lib/models/News';
import { IncomingForm, File } from 'formidable';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: newsId } = await context.params;
    if (!newsId) {
      return NextResponse.json(
        { success: false, error: 'newskey id is required' },
        { status: 400 }
      );
    }

    const news = await Job.findById(newsId);

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'news not  found' },
        { status: 404 }
      );
    }

    // Add imageUrl field if image exists
    let imageUrl = '';
    if (news.image && news.image.data && news.image.contentType) {
      const base64 = Buffer.from(news.image.data).toString('base64');
      imageUrl = `data:${news.image.contentType};base64,${base64}`;
    }

    return NextResponse.json(
      { success: true, data: { ...news.toObject(), imageUrl } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/news/[id]:', error);
    
    if (error instanceof Error && error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Invalid news ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch news details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id: newsId } = await context.params;
    if (!newsId) {
      return NextResponse.json(
        { success: false, error: 'News ID is required' },
        { status: 400 }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    let updateData: Record<string, any> = {};

    if (contentType.includes('multipart/form-data')) {
      // Buffer the request body
      const buffer = Buffer.from(await request.arrayBuffer());
      // Create a readable stream from the buffer
      const stream = Readable.from(buffer);
      // Patch: formidable expects headers on the stream
      (stream as any).headers = Object.fromEntries(request.headers.entries());
      const form = new IncomingForm({ keepExtensions: true, multiples: false });
      await new Promise<void>((resolve, reject) => {
        (form.parse as any)(stream, async (err: any, fields: Record<string, any>, files: Record<string, any>) => {
          if (err) return reject(err);
          const getString = (val: any) => Array.isArray(val) ? val[0] : val || '';
          updateData.title = getString(fields.title);
          updateData.content = getString(fields.content);
          updateData.organization = getString(fields.organization);
          updateData.category = getString(fields.category);
          updateData.status = getString(fields.status);
          updateData.postedDate = getString(fields.publishDate) ? new Date(getString(fields.publishDate)) : undefined;
          if (files.image) {
            const file = Array.isArray(files.image) ? files.image[0] : files.image;
            const fs = await import('fs/promises');
            const data = await fs.readFile(file.filepath || file.path);
            updateData.image = {
              data,
              contentType: file.mimetype,
            };
          }
          resolve();
        });
      });
    } else {
      // Handle JSON
      updateData = await request.json();
      if (typeof updateData.image === 'undefined' || updateData.image === null || updateData.image === '') {
        delete updateData.image;
      }
    }

    const news = await Job.findByIdAndUpdate(newsId, updateData, { new: true });
    if (!news) {
      return NextResponse.json(
        { success: false, error: 'News not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, data: news },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/news/[id]::', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update news' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: newsId } = await context.params;
    if (!newsId) {
      return NextResponse.json(
        { success: false, error: 'news ID is required' },
        { status: 400 }
      );
    }

    const news = await Job.findByIdAndDelete(newsId);

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'news not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'news deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/news/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete news' },
      { status: 500 }
    );
  }
}