const mongoose = require("mongoose");
const { MessageModel } = require("../models/MessageModel");
const { createResponseError } = require("../utils/error");

class MessageController {
  async index(req, res) {
    try {
      const { id: userId } = req.query;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).send();
        return;
      }

      const rooms = await MessageModel.find({ users: userId })
        .populate({ path: "users", select: ["-confirmed", "-email"] })
        .populate("messages.userBy", "username")
        .exec();

      res.status(201).json({
        status: "success",
        data: rooms,
      });
    } catch (e) {
      
      res.status(500).json(createResponseError(e));
    }
  }
  async show(req, res) {
    try {
      const roomId = req.params.id;

      if (!roomId) {
        res.status(400).json(createResponseError("Room not found"));
        return;
      }

      const room = await MessageModel.findById(roomId)
        .populate("users", "username")
        .populate("messages.userBy", ["username", "avatar"]);

      res.status(201).json({
        status: "success",
        data: room,
      });
    } catch (e) {
      res.status(500).json(createResponseError(e));
    }
  }
  async create(req, res) {
    try {
      const { user1Id, user2Id } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(user1Id) &&
        !mongoose.Types.ObjectId.isValid(user2Id)
      ) {
        res.status(400).json(createResponseError("Incorrect users"));
        return;
      }

      const data = {
        users: [user1Id, user2Id],
      };

      const room = await MessageModel.create(data);

      res.status(201).json({
        status: "success",
        data: room,
      });
    } catch (e) {
      res.status(500).json(createResponseError(e));
    }
  }
}

module.exports.MessageCtrl = new MessageController();
