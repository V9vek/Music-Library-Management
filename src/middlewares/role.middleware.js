import { ApiResponse } from "../utils/ApiResponse.js";

export function verifyRole(roles) {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        return res
          .status(403)
          .json(
            new ApiResponse(
              403,
              null,
              "Forbidden Access: Insufficient Permission."
            )
          );
      }

      next();
    } catch (error) {
      return res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
    }
  };
}
