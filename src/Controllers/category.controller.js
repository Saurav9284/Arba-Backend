const express = require('express');
const CategoryModel = require('../Models/category.model');
const CategoryController = express.Router();
const { default: mongoose } = require('mongoose');

// Get all Categories

CategoryController.get('/category',async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
    const categories = await CategoryModel.find({ owner: req.userId });
    res.status(200).json(categories);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});


// Create Category

CategoryController.post('/category',async (req, res) => {
    try {
      const { name, slug, image } = req.body;
      const { userId } = req;
      if (!userId) {
        return res.status(400).json({ msg: 'owner ID is required' });
      }
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ msg: 'Invalid owner ID' });
      }
      const category = await CategoryModel.create({ name, slug, image, owner:userId });
      res.status(200).json(category);
    } catch (error) {
      console.error(error.message);
      res.status(500).send(error.message);
    }
  });

// Update Category

CategoryController.patch('/category/update/:id',async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCategory = await CategoryModel.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});


// Get Category by ID

CategoryController.get('/category/:id',async (req, res) => {
  try {
    const { id } = req.params;
    const category = await CategoryModel.findById(id);
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Delete Category

CategoryController.delete('/category',async (req, res) => {
  try {
    const { id } = req.params;
    await CategoryModel.findByIdAndDelete(id);
    res.status(200).json({ msg: 'Category deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});


module.exports = CategoryController;
