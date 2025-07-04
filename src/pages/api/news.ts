import { IncomingForm, File } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import dbConnect from '@/lib/db';
import News from '@/lib/models/News';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    const form = new IncomingForm({
      keepExtensions: true,
      multiples: false,
    });

    form.parse(req, async (err: any, fields: any, files: any) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'Error parsing form' });
      }

      const getString = (val: string | string[] | undefined) => Array.isArray(val) ? val[0] : val || '';
      const title = getString(fields.title);
      const content = getString(fields.content);
      const organization = getString(fields.organization);
      const category = getString(fields.category);
      const status = getString(fields.status);
      const publishDate = getString(fields.publishDate);

      let image = undefined;
      if (files.image) {
        const file = Array.isArray(files.image) ? files.image[0] : files.image;
        const fs = await import('fs/promises');
        const data = await fs.readFile(file.filepath || file.path);
        image = {
          data,
          contentType: file.mimetype,
        };
      }

      await dbConnect();
      const news = await News.create({
        title,
        content,
        organization,
        category,
        status,
        postedDate: publishDate ? new Date(publishDate) : undefined,
        image,
      });

      res.status(201).json({ success: true, data: news });
    });
  } else if (req.method === 'GET') {
    try {
      await dbConnect();
      const news = await News.find({ status: 'published' }).sort({ postedDate: -1 });
      const newsWithImageUrl = news.map((item) => {
        let imageUrl = '';
        if (item.image && item.image.data && item.image.contentType) {
          const base64 = Buffer.from(item.image.data).toString('base64');
          imageUrl = `data:${item.image.contentType};base64,${base64}`;
        }
        return {
          ...item.toObject(),
          imageUrl,
        };
      });
      res.status(200).json({ success: true, data: newsWithImageUrl });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch news' });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
} 