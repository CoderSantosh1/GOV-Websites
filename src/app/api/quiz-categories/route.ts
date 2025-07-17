import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import QuizCategory from '@/lib/models/QuizCategory';

// GET: List all categories with subcategories
export async function GET() {
  await connectDB();
  const categories = await QuizCategory.find();
  return NextResponse.json(categories);
}

// POST: Add a new category or subcategory
export async function POST(request: Request) {
  await connectDB();
  const { name, icon, subcategory, subcategoryIcon } = await request.json();
  if (!name) {
    return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
  }
  let category = await QuizCategory.findOne({ name });
  if (!category) {
    // Create new category
    let subcategoriesArr: Array<{ name: string; icon?: string }> = [];
    if (subcategory) {
      try {
        subcategoriesArr = [{ name: subcategory, icon: typeof subcategoryIcon === 'string' ? subcategoryIcon : '' }];
      } catch (err) {
        console.error('Error creating subcategory array:', err);
        return NextResponse.json({ error: 'Invalid subcategory data' }, { status: 400 });
      }
    }
    category = new QuizCategory({
      name,
      icon: icon || '',
      subcategories: subcategoriesArr,
    });
    try {
      await category.save();
    } catch (err) {
      console.error('Error saving new category:', err);
      return NextResponse.json({ error: 'Failed to save category' }, { status: 500 });
    }
    return NextResponse.json(category);
  } else if (subcategory) {
    // Add subcategory if not exists
    try {
      if (!category.subcategories.some((sub: { name: string; icon: string }) => sub.name === subcategory)) {
        category.subcategories.push({ name: subcategory, icon: typeof subcategoryIcon === 'string' ? subcategoryIcon : '' });
        await category.save();
      }
    } catch (err) {
      console.error('Error adding subcategory:', err);
      return NextResponse.json({ error: 'Failed to add subcategory' }, { status: 500 });
    }
    return NextResponse.json(category);
  } else {
    return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
  }
}

// PUT: Edit category or subcategory
export async function PUT(request: Request) {
  await connectDB();
  const { oldName, newName, newIcon, oldSubcategory, newSubcategory, newSubcategoryIcon } = await request.json();
  if (oldName && newName) {
    // Rename category and/or update icon
    const update: { name: string; icon?: string } = { name: newName };
    if (typeof newIcon === 'string') update.icon = newIcon;
    const category = await QuizCategory.findOneAndUpdate({ name: oldName }, update, { new: true });
    return NextResponse.json(category);
  } else if (oldName && oldSubcategory && newSubcategory) {
    // Rename subcategory and/or update icon
    const category = await QuizCategory.findOne({ name: oldName });
    if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    const subcategoriesArrTyped = (category.subcategories as Array<{ name: string; icon?: string }>);
    const idx = subcategoriesArrTyped.findIndex((sub) => sub.name === oldSubcategory);
    if (idx === -1) return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
    subcategoriesArrTyped[idx].name = newSubcategory;
    if (typeof newSubcategoryIcon === 'string') subcategoriesArrTyped[idx].icon = newSubcategoryIcon;
    category.subcategories = subcategoriesArrTyped;
    await category.save();
    return NextResponse.json(category);
  }
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}

// DELETE: Remove category or subcategory
export async function DELETE(request: Request) {
  await connectDB();
  const { name, subcategory } = await request.json();
  if (name && !subcategory) {
    // Delete category
    await QuizCategory.deleteOne({ name });
    return NextResponse.json({ success: true });
  } else if (name && subcategory) {
    // Delete subcategory
    const category = await QuizCategory.findOne({ name });
    if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    category.subcategories = category.subcategories.filter((sub: { name: string; icon: string }) => sub.name !== subcategory);
    await category.save();
    return NextResponse.json(category);
  }
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
} 