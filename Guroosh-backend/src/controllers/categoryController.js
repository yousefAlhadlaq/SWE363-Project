const Category = require('../models/category');
const Expense = require('../models/expense');
const Budget = require('../models/budget');

// Map old icon names to emojis
const ICON_NAME_TO_EMOJI = {
  'home': '🏠',
  'utensils': '🍽️',
  'car': '🚗',
  'film': '🎬',
  'shopping-bag': '🛍️',
  'heart': '🩺',
  'book': '📚',
  'bolt': '⚡',
  'ellipsis-h': '📦',
  'briefcase': '💼',
  'chart-line': '📈',
  'gift': '🎁',
};

// Convert icon name to emoji if needed
const normalizeIcon = (icon) => {
  if (!icon) return '💳'; // default icon
  // Check if it's in our mapping first
  if (ICON_NAME_TO_EMOJI[icon]) {
    return ICON_NAME_TO_EMOJI[icon];
  }
  // If it contains emoji characters, return as-is
  if (/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(icon)) {
    return icon;
  }
  // Unknown icon name, return default
  return '💳';
};

const withEnabledFlag = (doc) => {
  if (!doc) return doc;
  const json = doc.toObject ? doc.toObject() : doc;
  return { ...json, enabled: json.isActive, icon: normalizeIcon(json.icon) };
};

// Get all categories for the authenticated user
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.userId })
      .sort({ createdAt: 1 })
      .lean();
    res.json({
      success: true,
      data: categories.map((category) => ({ 
        ...category, 
        enabled: category.isActive,
        icon: normalizeIcon(category.icon)
      }))
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: error.message || 'Error fetching categories' });
  }
};

// Get a single category
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      success: true,
      data: withEnabledFlag(category)
    });
  } catch (error) {
    console.error('Get category by id error:', error);
    res.status(500).json({ error: error.message || 'Error fetching category' });
  }
};

// Create a category
exports.createCategory = async (req, res) => {
  try {
    const { name, type, color, icon } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    // Prevent duplicates per user/type/name
    const existing = await Category.findOne({
      userId: req.userId,
      name: name.trim(),
      type
    });

    if (existing) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const category = await Category.create({
      userId: req.userId,
      name: name.trim(),
      type,
      color,
      icon
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: withEnabledFlag(category)
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: error.message || 'Error creating category' });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const updates = {};
    const { name, color, icon, type } = req.body;

    if (name !== undefined) updates.name = name.trim();
    if (color !== undefined) updates.color = color;
    if (icon !== undefined) updates.icon = icon;
    if (type !== undefined) updates.type = type;

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: withEnabledFlag(category)
    });
  } catch (error) {
    console.error('Update category error:', error);
    // Duplicate key errors from index
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Category with this name and type already exists' });
    }
    res.status(500).json({ error: error.message || 'Error updating category' });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, userId: req.userId });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const hasExpenses = await Expense.exists({ categoryId: category._id, userId: req.userId });
    if (hasExpenses) {
      return res.status(400).json({ error: 'Category has expenses and cannot be deleted. Disable it instead.' });
    }

    await Budget.deleteMany({ userId: req.userId, categoryId: category._id });
    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: error.message || 'Error deleting category' });
  }
};

exports.toggleCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, userId: req.userId });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    category.isActive = !category.isActive;
    await category.save();

    if (!category.isActive) {
      await Budget.updateMany(
        { userId: req.userId, categoryId: category._id, isActive: true },
        { $set: { isActive: false, notes: 'Automatically paused because category was disabled' } }
      );
    }

    res.json({
      success: true,
      message: `Category ${category.isActive ? 'enabled' : 'disabled'} successfully`,
      data: withEnabledFlag(category)
    });
  } catch (error) {
    console.error('Toggle category error:', error);
    res.status(500).json({ error: error.message || 'Failed to toggle category' });
  }
};
