const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    orderItems: [{
        name: {
            type: String,
            
        },
        quantity: {
            type: Number,
            
        },
        image: [
            {
                public_id: {
                    type: String,
                    required: true
                },
                url: {
                    type: String,
                    required: true
                },
            }
        ],
        price: {
            type: Number,
            
        },
        product: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product'
        }
    }
],
    shippingDetails: {
        address: {
            type: String,     
        },
        city: {
            type: String,    
        },
        phoneNo: { 
            type: String, 
        },
        postalCode: {
            type: String,
        },
        country: {
            type: String,
        }
    },
    status: {
        type: String,
        required: true,
        default: 'Pending',
    },
    totalPrice: {
        type: Number,
    },
    paymentMethod: {
        type: String,
        required: true
    },
    cardType: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    dateOrdered: {
        type: Date,
        default: Date.now,
    },
})

orderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

orderSchema.set('toJSON', {
    virtuals: true,
});

exports.Order = mongoose.model('Order', orderSchema);

