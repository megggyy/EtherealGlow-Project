const { User } = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

exports.getUsers = async (req, res, next) => {
    try {
        const userList = await User.find().select('-passwordHash');
        res.send(userList);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ message: 'The user with the given ID was not found.' });
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createUser = async (req, res, next) => {
    try {
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);

        let password = await bcrypt.hashSync(req.body.password, salt);

        let user = new User({
            name: req.body.name,
            email: req.body.email,
            passwordHash: password,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        });

        user = await user.save();

        res.send(user);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const userExist = await User.findById(req.params.id);
        let newPassword;
        if (req.body.password) {
            newPassword = bcrypt.hashSync(req.body.password, 10);
        } else {
            newPassword = userExist.passwordHash;
        }
        // const file = req.file;
        // const fileName = file.filename;
        // if (!file) return res.status(400).send('No image in the request');
        // const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                email: req.body.email,
                passwordHash: newPassword,
                phone: req.body.phone,
                isAdmin: req.body.isAdmin,
               // image: `${basePath}${fileName}`,
                street: req.body.street,
                apartment: req.body.apartment,
                zip: req.body.zip,
                city: req.body.city,
                country: req.body.country,
            },
            { new: true }
        );

        res.send(user);
    } catch (error) {
        res.status(400).send(error.message);
    }
};


exports.loginUser = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(400).send('The user not found');
        }

        if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
            const secret = process.env.secret;
            const token = jwt.sign(
                {
                    userId: user.id,
                    isAdmin: user.isAdmin
                },
                secret,
                { expiresIn: '1d' }
            );

            res.status(200).send({ user: user.email, token: token });
        } else {
            res.status(400).send('password is wrong!');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.registerUser = async (req, res, next) => {
    try {
        const file = req.file;
        const fileName = file.filename;
        if (!file) return res.status(400).send('No image in the request');
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        let user = new User({
            name: req.body.name,
            email: req.body.email,
            image: `${basePath}${fileName}`,
            passwordHash: bcrypt.hashSync(req.body.password, 10),
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        });
        user = await user.save();

        res.send(user);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndRemove(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "user not found!" });
        }
        res.status(200).json({ success: true, message: 'the user is deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getUserCount = async (req, res, next) => {
    try {
        const userCount = await User.countDocuments((count) => count);
        res.send({ userCount: userCount });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getUsersPerMonth = async (req, res, next) => {
    const getUsersPerMonth = await User.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            total: { $sum: 1 }, // Counting the number of users
          },
        },
        {
          $addFields: {
            month: {
              $let: {
                vars: {
                  monthsInString: [
                    null,
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sept",
                    "Oct",
                    "Nov",
                    "Dec",
                  ],
                },
                in: {
                  $arrayElemAt: ["$$monthsInString", "$_id.month"],
                },
              },
            },
          },
        },
        { $sort: { "_id.month": 1 } },
        {
          $project: {
            _id: 0,
            month: 1,
            total: 1,
          },
        },
      ]);
    
      console.log(getUsersPerMonth);
    
      if (!getUsersPerMonth) {
        return res.status(404).json({
          message: "Error fetching new users per month",
        });
      }
    
      res.status(200).json({
        success: true,
        getUsersPerMonth,
      });
  };


