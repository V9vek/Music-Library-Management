import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Artist } from "../models/artist.model.js";

const getAllArtists = asyncHandler(async (req, res) => {
  const { limit = 5, offset = 0, grammy = 0, hidden } = req.query;

  try {
    const query = {};
    if (grammy) query.grammy = grammy;
    if (hidden) query.hidden = hidden === "true";

    const artists = await Artist.find(query)
      .skip(parseInt(offset, 10))
      .limit(parseInt(limit, 10))
      .select("-createdAt -updatedAt -__v");

    return res
      .status(200)
      .json(new ApiResponse(200, artists, "Artists retrieved successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error." + error));
  }
});

const getArtistById = asyncHandler(async (req, res) => {
  const { id: _id } = req.params;
  try {
    const artist = await Artist.findById(_id).select(
      "-createdAt -updatedAt -__v"
    );
    if (!artist) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Artist not found."));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, artist, "Artist retrieved successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error." + error));
  }
});

const addArtist = asyncHandler(async (req, res) => {
  const { name, grammy, hidden } = req.body;
  const userRole = req.user.role;

  if (!name) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Artist name is required."));
  }

  try {
    // second check if the user is an Admin
    if (userRole !== "Admin") {
      return res
        .status(403)
        .json(
          new ApiResponse(403, null, "Forbidden: Only Admins can add artists.")
        );
    }

    await Artist.create({
      name: name,
      grammy: grammy || 0,
      hidden: hidden || false,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, null, "Artist created successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error." + error));
  }
});

const updateArtist = asyncHandler(async (req, res) => {
  const { id: _id } = req.params;
  const { name, grammy, hidden } = req.body;
  const userRole = req.user.role;

  try {
    // second check if the user is an Admin
    if (!["Admin", "Editor"].includes(userRole)) {
      return res
        .status(403)
        .json(
          new ApiResponse(
            403,
            null,
            "Forbidden: Only Admins and Editor can update artists."
          )
        );
    }

    const updatedArtist = await Artist.findByIdAndUpdate(
      _id,
      {
        name,
        grammy,
        hidden,
      },
      { new: true }
    ).select("-createdAt -updatedAt -__v");

    if (!updatedArtist) {
      return res
        .status(404)
        .json(new ApiResponse(404, updatedArtist, "Artist not found."));
    }

    return res
      .status(201)
      .json(
        new ApiResponse(201, updatedArtist, "Artist updated successfully.")
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error." + error));
  }
});

const deleteArtist = asyncHandler(async (req, res) => {
  const { id: _id } = req.params;
  const userRole = req.user.role;

  try {
    // second check: if requesting user is an Admin
    if (userRole !== "Admin") {
      return res
        .status(403)
        .json(
          new ApiResponse(
            403,
            null,
            "Forbidden: Only Admins can delete artists."
          )
        );
    }

    // if artist id exists
    const artistToDelete = await Artist.findByIdAndDelete(_id);
    if (!artistToDelete) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Artist not found."));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { artist_id: artistToDelete._id },
          `Artist:${artistToDelete.name} deleted successfully.`
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error." + error));
  }
});

export { getAllArtists, getArtistById, addArtist, updateArtist, deleteArtist };
