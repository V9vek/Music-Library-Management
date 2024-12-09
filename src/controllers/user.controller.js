import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const registerUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some((field) => field?.trim() === "")) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "All fields are required."));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(409)
      .json(new ApiResponse(409, null, "Email already exists."));
  }

  const userCount = await User.countDocuments();
  const role = userCount === 0 ? "Admin" : "Viewer";

  await User.create({
    email: email,
    password: password,
    role: role,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, null, "User created successfully."));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some((field) => field?.trim() === "")) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "All fields are required."));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found."));
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Invalid credentials."));
  }

  const token = user.generateAccessToken();

  return res
    .status(200)
    .json(new ApiResponse(200, { token }, "Login successful."));
});

const logoutUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, null, "User logged out successfully."));
});

const updatePassword = asyncHandler(async (req, res) => {
  const { old_password: oldPassword, new_password: newPassword } = req.body;
  const userId = req.user._id;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          "Old password and new password are required."
        )
      );
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found."));
  }

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Incorrect old password."));
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password updated successfully."));
});

const getUsersUnderAdmin = asyncHandler(async (req, res) => {
  const { role, limit = 5, offset = 0 } = req.query;
  const adminId = req.user._id;

  // second check: if requesting user is an Admin
  try {
    const requestingUser = await User.findById(adminId);
    if (!requestingUser || requestingUser.role !== "Admin") {
      return res
        .status(403)
        .json(new ApiResponse(403, null, "Only Admins can fetch users."));
    }

    const query = { admin: adminId };

    if (role) {
      if (!["Editor", "Viewer"].includes(role)) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              null,
              "Invalid role filter. Allowed roles are Editor and Viewer"
            )
          );
      }

      query.role = role;
    }

    const users = await User.find(query)
      .skip(parseInt(offset, 10))
      .limit(parseInt(limit, 10))
      .select("-password -admin -updatedAt -__v");

    return res
      .status(200)
      .json(new ApiResponse(200, users, "Users retrieved successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error."));
  }
});

const addUserUnderAdmin = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  const adminId = req.user._id;

  if ([email, password, role].some((field) => field?.trim() === "")) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "All fields are required."));
  }

  // only Editor and Viewer roles can be added
  if (!["Editor", "Viewer"].includes(role)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid role. Allowed roles are Editor and Viewer.",
    });
  }

  try {
    // second check: if requesting user is an Admin
    const requestingUser = await User.findById(adminId);
    if (!requestingUser || requestingUser.role !== "Admin") {
      return res
        .status(403)
        .json(
          new ApiResponse(403, null, "Forbidden: Only Admins can fetch users.")
        );
    }

    // if user email alreay exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json(new ApiResponse(409, null, "Email already exists."));
    }

    await User.create({
      email: email,
      password: password,
      role: role,
      admin: adminId, // adding the user under Admin
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "User created successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error."));
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id: _id } = req.params;
  const adminId = req.user._id;

  try {
    // second check: if requesting user is an Admin
    const requestingUser = await User.findById(adminId);
    if (!requestingUser || requestingUser.role !== "Admin") {
      return res
        .status(403)
        .json(
          new ApiResponse(403, null, "Forbidden: Only Admins can fetch users.")
        );
    }

    // if user id exists
    const userToDelete = await User.findById(_id);
    if (!userToDelete) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "User not found."));
    }

    // Admin can delete its own users only
    if (String(userToDelete.admin) !== String(adminId)) {
      return res
        .status(403)
        .json(
          new ApiResponse(
            403,
            null,
            "Forbidden: You can only delete users you manage."
          )
        );
    }

    await userToDelete.deleteOne();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          `User with email ${userToDelete.email} deleted successfully.`
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error." + error));
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getUsersUnderAdmin,
  addUserUnderAdmin,
  deleteUser,
  updatePassword,
};
