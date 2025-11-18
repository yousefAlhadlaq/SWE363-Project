import React, { useState } from 'react';
import InputField from '../Shared/InputField';
import Button from '../Shared/Button';

function CategoryManager({ categories = [], onAddCategory, onDeleteCategory }) {
  const [categoryName, setCategoryName] = useState('');

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    if (onAddCategory) onAddCategory(categoryName.trim());
    setCategoryName('');
  };

  const handleDeleteCategory = (name) => {
    if (onDeleteCategory) onDeleteCategory(name);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Category Manager</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Category Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Add New Category</h3>
          <form onSubmit={handleAddCategory}>
            <InputField
              label="Category Name"
              type="text"
              name="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g., Education, Travel"
              required
            />
            <Button type="submit" variant="primary">
              Add Category
            </Button>
          </form>
        </div>

        {/* Categories List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Existing Categories</h3>
          <div className="space-y-3">
            {(categories.length ? categories : []).map((category) => (
              <div
                key={category}
                className="p-4 border border-gray-200 rounded flex justify-between items-center"
              >
                <div>
                  <h4 className="font-semibold">{category}</h4>
                </div>
                <Button
                  onClick={() => handleDeleteCategory(category)}
                  variant="danger"
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryManager;
