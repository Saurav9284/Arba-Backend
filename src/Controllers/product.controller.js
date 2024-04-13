const ProductModel = require('../Models/product.model');
const express = require('express')
const authorization = require('../Middlewares/authorization')
const ProductController = express.Router()

// Get all Products
ProductController.get('/product', authorization, async (req, res) => {
  try {
    // const userId = req.userId;
    
    // if (!userId) {
    //   return res.status(401).json({ msg: 'Unauthorized' });
    // }
    
    // const query = { owner: userId };

    // if (req.query.category) {
    //   query.category = req.query.category;
    // }

    // const sort = {};

    // if (req.query.sort === 'price') {
    //   sort.price = 1;
    // }

    const products = await ProductModel.find()
    res.status(200).json(products);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});



// Create Product

ProductController.post('/product',authorization,async (req, res) => {
  try {
    const {title, description, price, category, image , owner} = req.body;
    const product = await ProductModel.create({title, description, price, category, image, owner});
    res.status(200).json(product);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error);
  }
});

// Update Product

ProductController.patch('/product/update/:id',authorization,async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await ProductModel.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.messsage);
  }
});


// Get Single Product

ProductController.get('/product/:id',authorization,async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.messsage);
  }
});

// Delete Product
ProductController.delete('/product/delete/:id',authorization,async (req, res) => {
  try {
    const { id } = req.params;
    await ProductModel.findByIdAndDelete(id);
    res.status(200).json({ msg: 'Product deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.messsage);
  }
});

module.exports = ProductController