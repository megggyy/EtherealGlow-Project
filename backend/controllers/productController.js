const { Product } = require('../models/product');
const { Category } = require('../models/category');
const { cloudinary } = require("../utils/cloudinary");
const { STATUSCODE } = require("../constants/index");
const ErrorHandler = require("../utils/errorHandler");

const uploadImage = async (files) => {
    let image = [];
    if (files && Array.isArray(files)) {
        image = await Promise.all(
            files.map(async (file) => {
                const result = await cloudinary.uploader.upload(file.path, {
                    public_id: file.filename,
                });
                return {
                    public_id: result.public_id,
                    url: result.secure_url,
                    originalname: file.originalname,
                };
            })
        );
    }
    if (image.length === STATUSCODE.ZERO)
        throw new ErrorHandler("At least one image is required");
    return image;
};

exports.getProductList = async (req, res, next) => {
    try {
        let filter = {};
        if (req.query.categories) {
            filter = { category: req.query.categories.split(',') };
        }
        const productList = await Product.find(filter).populate('category');
        res.status(200).send(productList);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.status(200).send(product);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createProduct = async (req, res, next) => {
    try {
        const category = await Category.findById(req.body.category);
        if (!category) {
            res.status(400).send('Invalid Category');
            return;
        }
        const image = await uploadImage(req.files);
        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            image: image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        });
        const savedProduct = await product.save();
        res.status(201).send(savedProduct);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(400).send('Invalid Product ID');
            return;
        }
        const category = await Category.findById(req.body.category);
        if (!category) {
            res.status(400).send('Invalid Category');
            return;
        }
        let image = product.image || [];
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            image = await uploadImage(req.files);
            if (product.image && product.image.length > 0) {
                await cloudinary.api.delete_resources(
                    product.image.map((image) => image.public_id)
                );
            }
        }
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description,
                image: image,
                brand: req.body.brand,
                price: req.body.price,
                category: req.body.category,
                countInStock: req.body.countInStock,
                rating: req.body.rating,
                numReviews: req.body.numReviews,
                isFeatured: req.body.isFeatured
            },
            { new: true }
        );
        res.status(200).send(updatedProduct);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndRemove(req.params.id);
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


