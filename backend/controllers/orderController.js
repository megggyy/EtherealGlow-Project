const { Order } = require('../models/order');
const { OrderItem } = require('../models/order-item');
const { User } = require('../models/user');
const { Product } = require('../models/product');
const fs = require("fs");
const pdf = require("html-pdf");
const path = require("path");
const { sendEmail } = require("../utils/sendEmail");

exports.getOrderList = async (req, res, next) => {
    try {
        const orderList = await Order.find().populate('user', 'name').sort({ 'dateOrdered': -1 });
        res.status(201).json(orderList);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name')
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    populate: 'category name price'
                }
            });

        if (!order) {
            res.status(500).json({ success: false });
        }
        res.send(order);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createOrder = async (req, res, next) => {
    try {
        const {
            orderItems,
            shippingDetails,
            totalPrice,
            status,
            paymentMethod,
            cardType,
        } = req.body;

        const order = new Order({
            orderItems,
            shippingDetails,
            status,
            totalPrice,
            paymentMethod,
            cardType,
            user: req.body.user,
        });

        const savedOrder = await order.save();

        if (!savedOrder)
            return res.status(400).send('The order cannot be created!');

        const user = await User.findById(req.body.user);

        if (!user)
            return res.status(400).send('User not found');

        const thankYouEmailOptions = `<html>
            <head>
                <style>
                </style>
            </head>
            <body>
                <div class="container">
                <h1>Dear ${user.name},</h1>
                <p>Your order (#${order._id}) has been confirmed. Wait for your parcel to arrive. Thank you for shopping with us!</p>
                <p>Order Items:</p>
                <ul>
                    ${order.orderItems.map(item => `<li>${item.name} - ${item.quantity} x $${item.price}</li>`).join('')}
                </ul>
                <p>Total Amount: $${order.totalPrice}</p>
                <p>Order Status: Confirmed</p>
                <p>Thank you for choosing our store!</p>
                <p>Please see attachments for your e-receipt.</p>
                </div>
            </body>
            </html>`;
          

        const receiptHtml = fs.readFileSync(
            path.resolve(__dirname, "..", "receipts", "receipt.html"),
            "utf-8"
        );
        const statusMap = {
            1: 'Completed',
            2: 'Shipped',
            3: 'Pending'
        };
        const populatedHtml = receiptHtml
            .replace('{{ customerName }}', user.name)
            .replace('{{ email }}', user.email)
            .replace('{{ phonenumber }}', user.phone)
            .replace('{{ shippingAddress }}', `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.postalCode}, ${shippingDetails.country}`)
            .replace('{{#each orderItems}}', order.orderItems.map(item => `
            <tr>
                <td class="item-name">${item.name}</td>
                <td class="item-price">${item.price}</td>
                <td class="item-quantity">${item.quantity}</td>
                <td class="item-total">${item.quantity * item.price}</td>
            </tr>
        `).join(''))
        .replace('{{ status }}', statusMap[order.status]) 
        .replace('{{ paymentMethod }}', order.paymentMethod)
        .replace('{{ totalPrice }}', order.totalPrice)
        const pdfOptions = { format: 'Letter' };
        pdf.create(populatedHtml, pdfOptions).toFile('./receipt.pdf', async function (err, response) {
            if (err) {
                console.error('Error generating PDF:', err);
            } else {
                try {
                    await sendEmail({
                        to: user.email,
                        subject: 'Thank you for your order!',
                        html: thankYouEmailOptions,
                        attachments: [{ path: response.filename }],
                    });

                    console.log('Order confirmation email sent with PDF attachment');
                } catch (error) {
                    console.error('Error sending order confirmation email:', error.message);
                }
            }
        });

        res.send(savedOrder);
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).send('An error occurred while placing the order.');
    }
};


exports.updateOrder = async (req, res, next) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                status: req.body.status
            },
            { new: true }
        );

        if (!order)
            return res.status(400).send('The order cannot be updated!');

        // Send email if order status is "Shipped" or "Completed"
        if (order.status === '2' || order.status === '1') {
            const user = await User.findById(order.user);

            if (!user)
                return res.status(400).send('User not found');

            let emailOptions;
            if (order.status === '2') {
                emailOptions = {
                    to: user.email,
                    subject: 'Your order has been shipped!',
                    html: `<p>Your order (#${order._id}) has been shipped. It will arrive soon!</p>`
                };
            } else if (order.status === '1') {
                emailOptions = {
                    to: user.email,
                    subject: 'Your order has been completed!',
                    html: `<p>Your order (#${order._id}) has been completed. Thank you for shopping with us!</p>`
                };
            }

            try {
                await sendEmail(emailOptions);
                console.log(`Order status email sent to ${user.email}`);
            } catch (error) {
                console.error('Error sending order status email:', error.message);
            }
        }

        res.send(order);
    } catch (error) {
        res.status(500).send(error.message);
    }
};


exports.deleteOrder = async (req, res, next) => {
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if (order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({ success: true, message: 'the order is deleted!' })
        } else {
            return res.status(404).json({ success: false, message: "order not found!" })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
};

exports.getTotalSales = async (req, res, next) => {
    try {
        const totalSales = await Order.aggregate([
            { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } }
        ]);

        if (!totalSales) {
            return res.status(400).send('The order sales cannot be generated');
        }

        res.send({ totalsales: totalSales.pop().totalsales });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.getOrderCount = async (req, res, next) => {
    try {
        const orderCount = await Order.countDocuments((count) => count);
        res.send({ orderCount: orderCount });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.getUserOrders = async (req, res, next) => {
    try {
        const userOrderList = await Order.find({ user: req.params.userid }).populate({
            path: 'orderItems', populate: {
                path: 'product', populate: 'category'
            }
        }).sort({ 'dateOrdered': -1 });

        if (!userOrderList) {
            res.status(500).json({ success: false });
        }
        res.send(userOrderList);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

