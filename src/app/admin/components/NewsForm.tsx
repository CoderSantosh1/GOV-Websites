'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface NewsFormData {
  title: string;
  content: string;
  organization: string;
  category: string;
  status: string;
  image?: string | File;
  imageUrl?: string;
}

interface NewsFormProps {
  initialData?: NewsFormData;
  onSubmit: (data: NewsFormData) => void | Promise<void>;
  onCancel: () => void;
}

export default function NewsForm({ initialData, onSubmit, onCancel }: NewsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewsFormData>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    organization: initialData?.organization || '',
    category: initialData?.category || '',
    status: initialData?.status || 'draft',
    image: initialData?.image || '',
    imageUrl: initialData?.imageUrl || '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [errors, setErrors] = useState<Partial<NewsFormData>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    validateForm();
    // Show preview for existing image if editing
    if (initialData?.imageUrl) {
      setImagePreview(initialData.imageUrl);
    } else if (initialData?.image) {
      if (typeof initialData.image === 'string') {
        // If it's already a full URL, use as is. If it's a relative path, prepend base path.
        const isFullUrl = initialData.image.startsWith('http') || initialData.image.startsWith('data:');
        setImagePreview(isFullUrl ? initialData.image : '/' + initialData.image.replace(/^\/+/g, ''));
      } else if (
        typeof initialData.image === 'object' &&
        'data' in initialData.image &&
        'contentType' in initialData.image &&
        initialData.image.data &&
        initialData.image.contentType
      ) {
        // Convert Buffer to base64 string for preview
        let base64 = '';
        if (Array.isArray(initialData.image.data)) {
          base64 = btoa(String.fromCharCode(...new Uint8Array(initialData.image.data)));
        } else if (typeof initialData.image.data === 'string') {
          base64 = initialData.image.data;
        }
        setImagePreview(`data:${initialData.image.contentType};base64,${base64}`);
      }
    } else {
      setImagePreview('');
    }
  }, [formData, initialData]);

  const validateForm = () => {
    const newErrors: Partial<NewsFormData> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    else if (formData.title.trim().length < 3) newErrors.title = 'Title must be at least 3 characters';

    if (!formData.content.trim()) newErrors.content = 'Content is required';
    else if (formData.content.trim().length < 10) newErrors.content = 'Content must be at least 10 characters';

    if (!formData.organization.trim()) newErrors.organization = 'Organization is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !validateForm()) return;

    setIsSubmitting(true);
    try {
      console.log('Submitting formData.image:', formData.image); // Debug log
      await onSubmit({ ...formData, image: imageFile || formData.image });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">{initialData ? 'Edit News' : 'Post New News'}</h2>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="organization" className="block text-sm font-medium text-gray-700">Organization</label>
          <Input
            id="organization"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            className={errors.organization ? 'border-red-500' : ''}
          />
          {errors.organization && <p className="text-red-500 text-sm mt-1">{errors.organization}</p>}
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={6}
            className={`mt-1 p-2 border rounded-md w-full ${errors.content ? 'border-red-500' : ''}`}
          />
          {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <Input
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={errors.category ? 'border-red-500' : ''}
          />
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <Select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image (optional)</label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
          />
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Preview" className="max-h-40 rounded border" />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t mt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="default" disabled={isSubmitting || !isFormValid}>
            {isSubmitting ? 'Processing...' : initialData ? 'Update News' : 'Post News'}
          </Button>
        </div>
      </form>
    </div>
  );
}
