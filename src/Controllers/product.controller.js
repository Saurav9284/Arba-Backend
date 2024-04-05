const express = require('express');
const ProductModel = require('../Models/product.model');
const authorization = require("../Middlewares/authorization");
const ProductController = express.Router();

// Get All Products
ProductController.get('/product', async (req, res) => {
  try {
    let query = ProductModel.find();

    // Sort by price 
    if (req.query.sort === 'price') {
      query = query.sort({ price: 1 }); // Ascending order
    }

    // Filter by category 
    if (req.query.category) {
      query = query.where({ category: req.query.category });
    }

    const products = await query.exec();
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create Product
ProductController.post("/product", authorization, async (req, res) => {
  try {
    const user = req.userId;
    const { title, description, price,  image,  category } = req.body;

    const product = await ProductModel.create({
      title,
      description,
      price,
      image,
      category,
      owner: user
    });

    res.status(201).json({ msg: 'Created', success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update Product
ProductController.patch('/product/update/:id', authorization, async (req, res) => {
  try {
    const { title, description, price, image, category } = req.body;
    const productId = req.params.id;
    
    const updateFields = { title, description, price, image ,category  };

    const product = await ProductModel.findByIdAndUpdate(
      productId,
      updateFields,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ msg: 'Product Updated', success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Read Single Product
ProductController.get('/product/:id', authorization, async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ msg: 'Product get', success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete Product
ProductController.delete('/product/delete/:id', authorization, async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await ProductModel.findByIdAndDelete(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({msg: 'Product deleted', success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = ProductController;
