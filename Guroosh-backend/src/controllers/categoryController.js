const Category = require('../models/category');

// Get all categories for the authenticated user
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.userId }).sort({ createdAt: 1 });
    res.json({
      success: true,
      data: categories
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
      data: category
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
      data: category
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
      data: category
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
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: error.message || 'Error deleting category' });
  }
};
