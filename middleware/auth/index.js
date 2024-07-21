import { StatusCodes } from "http-status-codes";
import { ValidationError } from "joi/lib/errors.js";
import { CustomError } from "../../helpers/custom_error.js";
import { responseGenerator } from "../../helpers/index.js";
import UserModel from "../../models/UserModel.js";

// verify user
export const verifyUser = async (req, res, next) => {
  try {
    const { role, _id: tokenUserId } = req?.tokenData || {};
    const requestUserId = req.body?._id || req.params?.id;

    const userData = await UserModel.findById(tokenUserId).lean().exec();
    if (!userData) throw new CustomError("User not found!");

    if (requestUserId && role === "USER" && tokenUserId !== requestUserId) {
      throw new CustomError("UNAUTHORIZED");
    }

    req.user = userData;

    next();
  } catch (error) {
    if (error instanceof ValidationError || error instanceof CustomError) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(responseGenerator({}, StatusCodes.BAD_REQUEST, error.message, 0));
    }
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(
        responseGenerator(
          {},
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Internal Server Error",
          0
        )
      );
  }
};

// verify admin
export const verifyAdmin = async (req, res, next) => {
  try {
    const isValid = ["ADMIN"].includes(req?.tokenData?.role);

    if (!isValid) throw new CustomError("Protected route, only for admins");

    next();
  } catch (error) {
    if (error instanceof ValidationError || error instanceof CustomError) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(responseGenerator({}, StatusCodes.BAD_REQUEST, error.message, 0));
    }
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(
        responseGenerator(
          {},
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Internal Server Error",
          0
        )
      );
  }
};
