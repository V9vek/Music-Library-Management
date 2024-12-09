import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Album } from "../models/album.model.js";
import { Artist } from "../models/artist.model.js";

const getAllAlbums = asyncHandler(async (req, res) => {
  const { artist_id, hidden, limit = 5, offset = 0 } = req.query;

  try {
    const query = {};
    if (artist_id) query.artist = artist_id;
    if (hidden) query.hidden = hidden === "true";

    const albums = await Album.find(query)
      .populate({
        path: "artist",
        select: "name -_id",
      })
      .skip(parseInt(offset, 10))
      .limit(parseInt(limit, 10))
      .select("-createdAt -updatedAt -__v");

    return res
      .status(200)
      .json(new ApiResponse(200, albums, "Albums retrieved successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error." + error));
  }
});

const getAlbumById = asyncHandler(async (req, res) => {
  const { id: _id } = req.params;

  try {
    // Validate album_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "Invalid album_id format. Must be a valid ObjectId."
          )
        );
    }

    const album = await Album.findById(_id)
      .populate({
        path: "artist",
        select: "name -_id",
      })
      .select("-createdAt -updatedAt -__v");

    if (!album) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Album not found."));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, album, "Album retrieved successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error." + error));
  }
});

const addAlbum = asyncHandler(async (req, res) => {
  const { name, artist_id, year, hidden } = req.body;
  const userRole = req.user.role;

  if (!name || !artist_id || !year) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, null, "Name, artist_id, and year are required.")
      );
  }

  try {
    // second check if the user is an Admin
    if (userRole !== "Admin") {
      return res
        .status(403)
        .json(
          new ApiResponse(403, null, "Forbidden: Only Admins can add albums.")
        );
    }

    // Validate artist_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(artist_id)) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "Invalid artist_id format. Must be a valid ObjectId."
          )
        );
    }

    // validate artist with artist_id exists
    const artist = Artist.findOne({ _id: artist_id });
    if (!artist) {
      return res
        .status(404)
        .json(
          new ApiResponse(404, null, `Artist with ${artist_id} not found.`)
        );
    }

    await Album.create({
      name: name,
      year: year,
      hidden: hidden || false,
      artist: artist_id,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, null, "Album created successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error." + error));
  }
});

const updateAlbum = asyncHandler(async (req, res) => {
  const { id: _id } = req.params;
  const { name, artist_id, year, hidden } = req.body;
  const userRole = req.user.role;

  try {
    // second check if the user is an Admin or Editor
    if (!["Admin", "Editor"].includes(userRole)) {
      return res
        .status(403)
        .json(
          new ApiResponse(
            403,
            null,
            "Forbidden: Only Admins and Editor can update albums."
          )
        );
    }

    // validate artist if exist with artist_id
    if (artist_id) {
      // Validate artist_id is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(artist_id)) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              null,
              "Invalid artist_id format. Must be a valid ObjectId."
            )
          );
      }

      const artist = await Artist.findOne({ _id: artist_id });
      if (!artist) {
        return res
          .status(404)
          .json(new ApiResponse(404, updatedArtist, "Artist not found."));
      }
    }

    // Validate album_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "Invalid album_id format. Must be a valid ObjectId."
          )
        );
    }

    const updatedAlbum = await Album.findByIdAndUpdate(
      _id,
      {
        $set: {
          name: name,
          artist: artist_id,
          year: year,
          hidden: hidden,
        },
      },
      { new: true }
    );

    if (!updatedAlbum) {
      return res
        .status(404)
        .json(new ApiResponse(404, updatedAlbum, `Album not found.`));
    }

    return res
      .status(201)
      .json(new ApiResponse(201, updatedAlbum, "Album updated successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error." + error));
  }
});

const deleteAlbum = asyncHandler(async (req, res) => {
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

    // Validate album_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "Invalid album_id format. Must be a valid ObjectId."
          )
        );
    }

    const deletedAlbum = await Album.findByIdAndDelete(_id);

    if (!deletedAlbum) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Album not found."));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          `Album:${deletedAlbum.name} deleted successfully.`
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error." + error));
  }
});

export { getAllAlbums, getAlbumById, addAlbum, updateAlbum, deleteAlbum };
