const CartModel = require('../Models/cart.model');
const express = require('express')

const CartContoller = express.Router();

// Create a new cart item

CartContoller.post('/cart',async (req, res) => {
    try {
      const { productId } = req.body;
      const { userId } = req;
  
      let cart = await CartModel.findOne({ productId, owner: userId });
  
      if (cart) {
        cart.quantity++;
      } else {
        cart = new Cart({ productId, quantity: 1, owner: userId });
      }
  
      const savedCartItem = await cart.save();
      res.status(201).json(savedCartItem);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

// Delete a cart item

CartContoller.patch('/cart/delete/:id',async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
  
      if (quantity === 0) {
        const deletedCartItem = await CartModel.findByIdAndDelete(id);
        if (!deletedCartItem) {
          return res.status(404).json({ message: 'Cart item not found' });
        }
        return res.json({ message: 'Cart item deleted successfully' });
      }
  
      const updatedCartItem = await CartModel.findByIdAndUpdate(id, { quantity }, { new: true });
      res.json(updatedCartItem);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });


// Get all cart items

CartContoller.get('/cart',async (req, res) => {
    try {
      const { userId } = req;
      
      const cartItems = await Cart.find({ owner: userId });
      
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

module.exports = CartContoller