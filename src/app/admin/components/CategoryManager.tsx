import React, { useEffect, useState } from 'react';

interface Subcategory {
  name: string;
  icon?: string;
}
interface Category {
  _id: string;
  name: string;
  icon?: string;
  subcategories: Subcategory[];
}

function isCloudinaryUrl(url: string) {
  return /^https?:\/\/res\.cloudinary\.com\//.test(url);
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('');
  const [newCategoryIconFile, setNewCategoryIconFile] = useState<File | null>(null);
  const [newCategoryIconPreview, setNewCategoryIconPreview] = useState<string>('');
  const [newSubcategory, setNewSubcategory] = useState<{ [key: string]: string }>({});
  const [newSubcategoryIcon, setNewSubcategoryIcon] = useState<{ [key: string]: string }>({});
  const [newSubcategoryIconFile, setNewSubcategoryIconFile] = useState<{ [key: string]: File | null }>({});
  const [newSubcategoryIconPreview, setNewSubcategoryIconPreview] = useState<{ [key: string]: string }>({});
  const [editCategory, setEditCategory] = useState<{ id: string; value: string } | null>(null);
  const [editSubcategory, setEditSubcategory] = useState<{ catId: string; oldName: string; name: string; icon: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch('/api/quiz-categories');
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add new category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    if (!newCategoryIcon.trim()) {
     
      return;
    }
    if (!isCloudinaryUrl(newCategoryIcon.trim())) {
      alert('Please upload a valid icon.');
      return;
    }
    await fetch('/api/quiz-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategory.trim(), icon: newCategoryIcon.trim() }),
    });
    setNewCategory('');
    setNewCategoryIcon('');
    setNewCategoryIconPreview('');
    fetchCategories();
  };

  // Add subcategory
  const handleAddSubcategory = async (catId: string, catName: string) => {
    const sub = newSubcategory[catId]?.trim();
    const subIcon = newSubcategoryIcon[catId]?.trim();
    if (!sub) return;
    if (!subIcon) {
      alert('Please select and upload an icon for the subcategory.');
      return;
    }
    await fetch('/api/quiz-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: catName, subcategory: sub, subcategoryIcon: subIcon }),
    });
    setNewSubcategory((prev) => ({ ...prev, [catId]: '' }));
    setNewSubcategoryIcon((prev) => ({ ...prev, [catId]: '' }));
    setNewSubcategoryIconPreview((prev) => ({ ...prev, [catId]: '' }));
    fetchCategories();
  };

  // Edit category
  const handleEditCategory = async () => {
    if (!editCategory || !editCategory.value.trim()) return;
    await fetch('/api/quiz-categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldName: categories.find(c => c._id === editCategory.id)?.name, newName: editCategory.value.trim() }),
    });
    setEditCategory(null);
    fetchCategories();
  };

  // Edit subcategory
  const handleEditSubcategory = async () => {
    if (!editSubcategory || !editSubcategory.name.trim()) return;
    const cat = categories.find(c => c._id === editSubcategory.catId);
    if (!cat) return;
    await fetch('/api/quiz-categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldName: cat.name, oldSubcategory: editSubcategory.oldName, newSubcategory: editSubcategory.name.trim() }),
    });
    setEditSubcategory(null);
    fetchCategories();
  };

  // Delete category
  const handleDeleteCategory = async (catName: string) => {
    await fetch('/api/quiz-categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: catName }),
    });
    fetchCategories();
  };

  // Delete subcategory
  const handleDeleteSubcategory = async (catName: string, sub: string) => {
    await fetch('/api/quiz-categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: catName, subcategory: sub }),
    });
    fetchCategories();
  };

  // Handle category icon file selection and upload
  const handleCategoryIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewCategoryIconFile(file);
      setNewCategoryIconPreview(URL.createObjectURL(file));
      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/quiz-categories/upload-icon', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setNewCategoryIcon(data.imageUrl);
      }
    }
  };

  // Handle subcategory icon file selection and upload
  const handleSubcategoryIconChange = async (catId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewSubcategoryIconFile(prev => ({ ...prev, [catId]: file }));
      setNewSubcategoryIconPreview(prev => ({ ...prev, [catId]: URL.createObjectURL(file) }));
      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/quiz-categories/upload-icon', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setNewSubcategoryIcon(prev => ({ ...prev, [catId]: data.imageUrl }));
      }
    }
  };

  // Recursively flatten any nested arrays in subcategories
  function flattenSubcategories(arr: any[]): any[] {
    return arr.reduce((acc, val) => {
      if (Array.isArray(val)) {
        return acc.concat(flattenSubcategories(val));
      } else {
        return acc.concat(val);
      }
    }, []);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Manage Quiz Categories</h2>
      <div className="flex gap-2 mb-6">
        <input
          className="border px-2 py-1 rounded w-full"
          placeholder="Add new category"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          className="border px-2 py-1 rounded w-full"
          onChange={handleCategoryIconChange}
        />
        {newCategoryIconPreview && (
          <img src={newCategoryIconPreview} alt="icon preview" className="w-8 h-8 rounded border" />
        )}
        <button className="bg-blue-600 text-white px-4 py-1 rounded" onClick={handleAddCategory}>Add</button>
      </div>
      {loading ? <div>Loading...</div> : (
        <ul className="space-y-4">
          {categories.map(cat => (
            <li key={cat._id} className="border rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                {editCategory?.id === cat._id ? (
                  <>
                    <input
                      className="border px-2 py-1 rounded"
                      value={editCategory.value}
                      onChange={e => setEditCategory({ ...editCategory, value: e.target.value })}
                    />
                    <button className="text-green-600" onClick={handleEditCategory}>Save</button>
                    <button className="text-gray-500" onClick={() => setEditCategory(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    {cat.icon && (
                      <img src={cat.icon} alt="icon" className="w-6 h-6 inline-block mr-2" />
                    )}
                    <span className="font-semibold text-lg">{typeof cat.name === 'string' ? cat.name : '[Invalid name]'}</span>
                    <button className="text-blue-600" onClick={() => setEditCategory({ id: cat._id, value: cat.name })}>Edit</button>
                    <button className="text-red-600" onClick={() => handleDeleteCategory(cat.name)}>Delete</button>
                  </>
                )}
              </div>
              <div className="ml-4">
                <ul className="mb-2">
                  {(() => {
                    const flatSubcategories = flattenSubcategories(cat.subcategories);
                    return flatSubcategories.map((sub: any, idx: number) => {
                      if (!sub || typeof sub !== 'object' || Array.isArray(sub) || typeof sub.name !== 'string') {
                        return null;
                      }
                      return (
                        <li key={sub.name + idx} className="flex items-center gap-2 mb-1">
                          {editSubcategory && editSubcategory.catId === cat._id && editSubcategory.oldName === sub.name ? (
                            <>
                              <input
                                className="border px-2 py-1 rounded"
                                value={editSubcategory.name}
                                onChange={e => setEditSubcategory({ ...editSubcategory, name: e.target.value })}
                              />
                              <input
                                className="border px-2 py-1 rounded"
                                value={editSubcategory.icon}
                                onChange={e => setEditSubcategory({ ...editSubcategory, icon: e.target.value })}
                                placeholder="Icon URL or emoji"
                              />
                              <button className="text-green-600" onClick={async () => {
                                await fetch('/api/quiz-categories', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    oldName: cat.name,
                                    oldSubcategory: editSubcategory.oldName,
                                    newSubcategory: editSubcategory.name,
                                    newSubcategoryIcon: editSubcategory.icon,
                                  }),
                                });
                                setEditSubcategory(null);
                                fetchCategories();
                              }}>Save</button>
                              <button className="text-gray-500" onClick={() => setEditSubcategory(null)}>Cancel</button>
                            </>
                          ) :
                            <>
                              {sub.icon && (
                                <img src={sub.icon} alt="icon" className="w-5 h-5 inline-block mr-1" />
                              )}
                              <span>{typeof sub.name === 'string' ? sub.name : '[Invalid name]'}</span>
                              <button className="text-blue-600 ml-2" onClick={() => setEditSubcategory({ catId: cat._id, oldName: sub.name, name: sub.name, icon: sub.icon || '' })}>Edit</button>
                              <button className="text-red-600 ml-1" onClick={async () => {
                                await fetch('/api/quiz-categories', {
                                  method: 'DELETE',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ name: cat.name, subcategory: sub.name }),
                                });
                                fetchCategories();
                              }}>Delete</button>
                            </>
                          }
                        </li>
                      );
                    });
                  })()}
                </ul>
                <div className="flex gap-2">
                  <input
                    className="border px-2 py-1 rounded w-full"
                    placeholder="Add subcategory"
                    value={newSubcategory[cat._id] || ''}
                    onChange={e => setNewSubcategory(prev => ({ ...prev, [cat._id]: e.target.value }))}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="border px-2 py-1 rounded w-full"
                    onChange={e => handleSubcategoryIconChange(cat._id, e)}
                  />
                  {newSubcategoryIconPreview[cat._id] && (
                    <img src={newSubcategoryIconPreview[cat._id]} alt="icon preview" className="w-7 h-7 rounded border" />
                  )}
                  <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => handleAddSubcategory(cat._id, cat.name)}>Add</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoryManager; 