import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Album } from "../models/album.model.js";
import { Artist } from "../models/artist.model.js";
import { Track } from "../models/track.model.js";

const getAllTracks = asyncHandler(async (req, res) => {
  const { album_id, artist_id, limit = 5, offset = 0 } = req.query;

  try {
    const query = {};
    if (album_id) query.album = album_id;
    if (artist_id) query.artist = artist_id;

    const albums = await Track.find(query)
      .populate({
        path: "album",
        select: "name -_id",
      })
      .populate({
        path: "artist",
        select: "name -_id",
      })
      .skip(parseInt(offset, 10))
      .limit(parseInt(limit, 10))
      .select("-createdAt -updatedAt -__v");

    return res
      .status(200)
      .json(new ApiResponse(200, albums, "Tracks retrieved successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error." + error));
  }
});

const getTrackById = asyncHandler(async (req, res) => {
  const { id: _id } = req.params;

  try {
    // Validate track_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "Invalid track_id format. Must be a valid ObjectId."
          )
        );
    }

    const track = await Track.findById(_id)
      .populate({
        path: "album",
        select: "name -_id",
      })
      .populate({
        path: "artist",
        select: "name -_id",
      })
      .select("-createdAt -updatedAt -__v");

    if (!track) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Track not found."));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, track, "Track retrieved successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error." + error));
  }
});

const addTrack = asyncHandler(async (req, res) => {
  const { name, duration, album_id, artist_id, hidden } = req.body;
  const userRole = req.user.role;

  if (!name || !duration || !album_id || !artist_id) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          "Name, duration, album_id, and artist_id are required."
        )
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

    // Validate album_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(album_id)) {
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

    // validate album with album_id exists
    const album = Album.findById(album_id);
    if (!album) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, `Album with ${album_id} not found.`));
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
    const artist = Artist.findById(artist_id);
    if (!artist) {
      return res
        .status(404)
        .json(
          new ApiResponse(404, null, `Artist with ${artist_id} not found.`)
        );
    }

    await Track.create({
      name,
      duration,
      album: album_id,
      artist: artist_id,
      hidden: hidden || false,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, null, "Track created successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error." + error));
  }
});

const updateTrack = asyncHandler(async (req, res) => {
  const { id: _id } = req.params;
  const { name, duration, album_id, artist_id, hidden } = req.body;
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
            "Forbidden: Only Admins and Editor can update tracks."
          )
        );
    }

    // validate album if exist with album_id
    if (album_id) {
      // Validate album_id is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(album_id)) {
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

      const album = await Album.findById(album_id);
      if (!album) {
        return res
          .status(404)
          .json(new ApiResponse(404, null, "Album not found."));
      }
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

      const artist = await Artist.findById(artist_id);
      if (!artist) {
        return res
          .status(404)
          .json(new ApiResponse(404, null, "Artist not found."));
      }
    }

    // Validate track_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "Invalid track_id format. Must be a valid ObjectId."
          )
        );
    }

    const updatedTrack = await Track.findByIdAndUpdate(
      _id,
      {
        $set: { name, duration, album: album_id, artist: artist_id, hidden },
      },
      { new: true }
    )
      .populate({
        path: "album",
        select: "name -_id",
      })
      .populate({
        path: "artist",
        select: "name -_id",
      })
      .select("-createdAt -updatedAt -__v");

    if (!updatedTrack) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, `Track not found.`));
    }

    return res
      .status(201)
      .json(new ApiResponse(201, updatedTrack, "Track updated successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error." + error));
  }
});

const deleteTrack = asyncHandler(async (req, res) => {
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

    // Validate track_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "Invalid track_id format. Must be a valid ObjectId."
          )
        );
    }

    const deletedTrack = await Track.findByIdAndDelete(_id);

    if (!deletedTrack) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Track not found."));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          `Track:${deletedAlbum.name} deleted successfully.`
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error." + error));
  }
});

export { getAllTracks, getTrackById, addTrack, updateTrack, deleteTrack };
