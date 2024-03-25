const { Category } = require('../models/category');
const { cloudinary } = require("../utils/cloudinary");
const { STATUSCODE } = require("../constants/index");
const ErrorHandler = require("../utils/errorHandler");

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

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

exports.getCategoryList = async (req, res, next) => {
    try {
        const categoryList = await Category.find();
        res.status(200).send(categoryList);
    } catch (error) {
        next(error);
    }
};

exports.getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'The category with the given ID was not found.' });
        }
        res.status(200).send(category);
    } catch (error) {
        next(error);
    }
};

exports.createCategory = async (req, res, next) => {
    try {
        const image = await uploadImage(req.files);
        let category = new Category({
            name: req.body.name,
            description: req.body.description,
            image: image,
        });
        category = await category.save();
        res.send(category);
    } catch (error) {
        next(error);
    }
};

exports.updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).send('Invalid Category ID!');
        }
        let image = category.image || [];
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            image = await uploadImage(req.files);
            if (category.image && category.image.length > 0) {
                await cloudinary.api.delete_resources(
                    category.image.map((image) => image.public_id)
                );
            }
        }
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description,
                image: image,
            },
            { new: true }
        );
        res.send(updatedCategory);
    } catch (error) {
        next(error);
    }
};

exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndRemove(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found!" });
        }
        res.status(200).json({ success: true, message: 'The category is deleted!' });
    } catch (error) {
        next(error);
    }
};
