const { Order } = require('../models/order');
const { OrderItem } = require('../models/order-item');
const { User } = require('../models/user');
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
        const orderItemsIds = await Promise.all(req.body.orderItems.map(async (orderItem) => {
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product
            });

            newOrderItem = await newOrderItem.save();

            return newOrderItem._id;
        }));

        const order = new Order({
            orderItems: orderItemsIds,
            shippingAddress1: req.body.shippingAddress1,
            shippingAddress2: req.body.shippingAddress2,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: req.body.phone,
            status: req.body.status,
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
                    <h1>Thank You!</h1>
                    <p>Thank you for your order.</p>
                    <p>See attachments for your order details.</p>
                </div>
            </body>
            </html>`;

        const receiptHtml = fs.readFileSync(
            path.resolve(__dirname, "..", "receipts", "receipt.html"),
            "utf-8"
        );

        const populatedHtml = receiptHtml
            .replace('{{ customerName }}', user.name)
            .replace('{{ email }}', user.email)
            .replace('{{ phonenumber }}', user.phone)
            .replace('{{ shippingAddress }}', order.shippingAddress1)
            // .replace('{{#each orderItems}}', order.orderItems.map(item => `
            //     <tr>
            //         <td class="product">${item.product.name}</td>
            //         <td class="item-name">${item.product.name}</td>
            //         <td class="item-price">${item.product.price}</td>
            //         <td class="item-quantity">${item.quantity}</td>
            //         <td class="item-total">${item.quantity * item.product.price}</td>
            //     </tr>
            // `).join(''));

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
            return res.status(400).send('the order cannot be update!')

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

