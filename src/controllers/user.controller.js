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

export { registerUser, loginUser, logoutUser };
