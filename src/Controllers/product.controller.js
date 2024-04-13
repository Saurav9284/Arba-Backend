const ProductModel = require('../Models/product.model');
const express = require('express')
const authorization = require('../Middlewares/authorization')
const ProductController = express.Router()

// Get all Products
ProductController.get("/product", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 12;
    
    let query = {};

    // Filtering 
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Sorting 
    const sortOptions = {};
    if (req.query.sort) {
      sortOptions[req.query.sort] = req.query.order === "desc" ? -1 : 1;
    }

    // Searching with name
    if (req.query.title) {
      // Use a regex for partial matching
      query.title = { $regex: new RegExp(req.query.title, "i") };
    }

      query.createrId = req.userId;
    
    const totalItems = await NoteModel.countDocuments(query);
    const totalPages = Math.ceil(totalItems / pageSize);

    const data = await ProductModel.find(query)
      .sort(sortOptions)
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    res.json({
      data,
      page,
      totalPages,
      totalItems,
    });
  } catch (error) {
    res.send({ message: "Internal server error" });
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