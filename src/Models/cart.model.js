const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  productId: { type : String, required : true },
  quantity: Number,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const CartModel = mongoose.model('Cart', cartSchema);

module.exports = CartModel