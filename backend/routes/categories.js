const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const { cloudinary } = require("../utils/cloudinary");
const { STATUSCODE, RESOURCE } = require("../constants/index");
const ErrorHandler = require("../utils/errorHandler");

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});
const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
    const categoryList = await Category.find();

    if (!categoryList) {
        res.status(500).json({ success: false })
    }
    res.status(200).send(categoryList);
})

router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(500).json({ message: 'The category with the given ID was not found.' })
    }
    res.status(200).send(category);
})

router.post(`/`, uploadOptions.array('image', 5), async (req, res) => {
    console.log(req)
    let image = [];
  if (req.files && Array.isArray(req.files)) {
    image = await Promise.all(
      req.files.map(async (file) => {
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

    let category = new Category({
        name: req.body.name,
        description: req.body.description,
        image: image,
    })
    category = await category.save();

    if (!category)
        return res.status(400).send('the category cannot be created!')

    res.send(category);
})

router.put('/:id', uploadOptions.array('image', 5), async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id);
    if (!category) return res.status(400).send('Invalid Product!');
    let image = category.image || [];
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
          image = await Promise.all(
            req.files.map(async (file) => {
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

    if (!updatedCategory)
        return res.status(400).send('the category cannot be updated!')

    res.send(category);
})

router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id).then(category => {
        if (category) {
            return res.status(200).json({ success: true, message: 'the category is deleted!' })
        } else {
            return res.status(404).json({ success: false, message: "category not found!" })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
})

module.exports = router;