const { sendEmail } = require("../utils/sendEmail");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/UserModel");
const { generateMD5 } = require("../utils/generateHash");
const { deleteFile } = require("../utils/deleteFile");
const { createResponseError } = require("../utils/error");

class UserController {
  async index(req, res) {
    try {
      const { pageNumber = 1, userNameSearch = "" } = req.query;
      const pageSize = 12;

      const totalUsersCount = await UserModel.countDocuments({
        username: { $regex: userNameSearch, $options: "i" },
      }).exec();

      const totalPageCount = Math.ceil(totalUsersCount / pageSize);
      let skip = (pageNumber - 1) * pageSize;

      if (pageNumber > totalPageCount) {
        skip = (totalPageCount - 1) * pageSize;
      }
      if (skip < 0) {
        skip = totalPageCount * pageSize;
      }

      const users = await UserModel.find({
        username: { $regex: userNameSearch, $options: "i" },
      })
        .select(["-email", "-confirmed"])
        .limit(pageSize)
        .skip(skip)
        .exec();
      res.json({
        status: "success",
        data: {
          users,
          totalPageCount,
        },
      });
    } catch (e) {
      res.status(500).json(createResponseError(JSON.stringify(e)));
    }
  }

  async show(req, res) {
    try {
      const userId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json(createResponseError("Invalid user"));
        return;
      }

      const user = await UserModel.findById(userId).exec();

      if (!user) {
        res.status(404).json(createResponseError("User isn't found"));
      } else {
        res.json({
          status: "success",
          data: user,
        });
      }
    } catch (e) {
      res.status(500).json(createResponseError(JSON.stringify(e)));
    }
  }

  async create(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(400).json(createResponseError(JSON.stringify(errors.array())));
        return;
      }

      const data = {
        email: req.body.email,
        username: req.body.username,
        password: generateMD5(req.body.password + process.env.SECRET_KEY),
        confirmHash: generateMD5(
          process.env.SECRET_KEY || Math.random().toString()
        ),
      };

      const foundUser = await UserModel.findOne({ $or: [
        {
          username: data.username
        },
        {
          email: data.email
        }
      ]}).exec();

      if (foundUser) {
        res.status(400).json(createResponseError("User already exists"));
        return;
      }
      
      const user = await UserModel.create(data);

      try {
        await sendEmail(
          {
            emailFrom: process.env.NODEMAILER_USER,
            emailTo: data.email,
            subject: "Verify your email address Chat",
            html: `Please verify your email address by clicking this
  <a href="http://localhost:${process.env.PORT || 8888}/auth/verify?hash=${
              data.confirmHash
            }">link</a>`,
          }
        );
      } catch(err) {
        throw new Error(err);
      }

      res.status(201).json({
        status: "success",
        data: user,
      });
    } catch (e) {
      res.status(500).json(createResponseError(e));
    }
  }

  async verify(req, res) {
    try {
      const hash = req.query.hash;

      if (!hash) {
        res.status(400).json(createResponseError("Incorrect hash"));
        return;
      }

      const user = await UserModel.findOne({ confirmHash: hash }).exec();

      if (!user) {
        res.status(404).json(createResponseError("User isn't found"));
        return;
      }

      user.confirmed = true;
      user.save();

      res.json({
        status: "success",
      });
    } catch (e) {
      res.status(500).json(createResponseError(e));
    }
  }

  async login(req, res) {
    try {
      const user = req.user;

      const token = jwt.sign({ data: req.user }, process.env.SECRET_KEY, {
        expiresIn: process.env.EXPIRES_IN,
      });

      res.status(200).json({
        status: "success",
        data: {
          ...user,
          token,
        },
      });
    } catch (e) {
      res.status(500).json(createResponseError(e));
    }
  }

  async getUserInfo(req, res) {
    try {
      const user = req.user ? req.user.toJSON() : undefined;

      res.json({
        status: "success",
        data: user,
      });
    } catch (e) {
      res.status(500).json(createResponseError(e));
    }
  }

  async updateAvatar(req, res) {
    try {
      const { user: { _id: userId }, file } = req;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json(createResponseError("Incorrect userID"));
        return;
      }

      if (!file) {
        res.status(400).json(createResponseError("Incorrect file"));
        return;
      }

      const user = await UserModel.findById(userId).exec();

      if (!user) {
        res.status(404).json(createResponseError("User not found"));
        return;
      }

      if (user.avatar) {
        await deleteFile(user.avatar);
      }

      await user.updateOne({
        avatar: file.path
      }).exec()

      res.json({
        status: "success",
        data: {
          ...user.toJSON(),
          avatar: file.path
        },
      });
    } catch (e) {
      res.status(500).json(createResponseError(e));
    }
  }

  async fargotPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(createResponseError(JSON.stringify(errors.array())));
        return;
      }

      const { email } = req.body;

      const user = await UserModel.findOne({ email }).exec();

      if (!user) {
        res.status(404).json(createResponseError("User not found"));
        return;
      }

      if (!user.confirmed) {
        res.status(406).json(createResponseError("Email isn't confirmed"));
        return;
      }
      
      const token = jwt.sign(
        { _id: user._id },
        process.env.RESET_PASSWORD_KEY,
        { expiresIn: "20m" }
      );

      await user.updateOne({ resetPassword: token }).exec();

      try {
        await sendEmail(
          {
            emailFrom: process.env.NODEMAILER_USER,
            emailTo: user.email,
            subject: "Reset password Chat",
            html: `Please reset your password by clicking this
              <a href="${process.env.CLIENT_URL}/auth/resetpassword/${token}">link</a>`,
          }
        );

        res.status(201).json({
          status: "success",
          data: {
            message: "Email has been sent",
          },
        });
      } catch(err) {
        throw new Error(JSON.stringify(err))
      }
    } catch (e) {
      res.status(500).json(createResponseError(e));
    }
  }

  async resetPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(createResponseError(JSON.stringify(errors.array())));
        return;
      }

      const { resetToken, password } = req.body;

      if (!resetToken) {
        return res
          .status(400)
          .json(createResponseError("Incorrect token"));
      }

      jwt.verify(resetToken, process.env.RESET_PASSWORD_KEY);

      const user = await UserModel.findOne({
        resetPassword: resetToken,
      }).exec();

      if (!user) {
        return res.status(404).json(createResponseError("User not found"));
      }

      await user.updateOne({
        password: generateMD5(password + process.env.SECRET_KEY),
      });

      res.status(201).json({
        status: "success",
        data: {
          message: "Password has been changed",
        },
      });
    } catch (e) {
      res.status(500).json(createResponseError(e));
    }
  }
}

module.exports.UserCtrl = new UserController();
