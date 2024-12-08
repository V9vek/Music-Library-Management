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

export { registerUser, loginUser };
