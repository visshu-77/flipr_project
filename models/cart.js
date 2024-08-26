const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
productId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product',
    required: true 
},
quantity: { 
    type: Number, 
    required: true 
}
});

const cartSchema = new mongoose.Schema({
    items: [itemSchema]
});

module.exports = mongoose.model('Cart', cartSchema);