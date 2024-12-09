import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Album } from "../models/album.model.js";
import { Artist } from "../models/artist.model.js";
import { Track } from "../models/track.model.js";
import { Favourite } from "../models/favourite.model.js";

const getFavorites = asyncHandler(async (req, res) => {
  const { category, limit = 5, offset = 0 } = req.query;
  const userId = req.user._id;

  try {
    const query = { user: userId };

    if (category) {
      if (!["artist", "album", "track"].includes(category)) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              null,
              "Invalid category. Allowed values are artist, album, track."
            )
          );
      }
      query.category = category;
    }

    const favorites = await Favourite.find(query)
      .populate({
        path: "item_id",
      })
      .skip(parseInt(offset, 10))
      .limit(parseInt(limit, 10))
      .select("-user -__v -createdAt -updatedAt")
      .lean()

    const populatedFavorites = await Promise.all(
      favorites.map(async (fav) => {
        let model;
        switch (fav.category) {
          case "artist":
            model = Artist;
            break;
          case "album":
            model = Album;
            break;
          case "track":
            model = Track;
            break;
          default:
            break;
        }

        const itemName = await model.findById(fav.item_id).select("name");

        return {
          ...fav,
          name: itemName.name,
        };
      })
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          populatedFavorites,
          "Favorites retrieved successfully."
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error." + error));
  }
});

const addFavroite = asyncHandler(async (req, res) => {
  const { item_id, category } = req.body;
  const userId = req.user._id;

  if (!item_id || !category) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "item_id and category are required."));
  }

  if (!["artist", "album", "track"].includes(category)) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          "Invalid category. Allowed values are artist, album, track"
        )
      );
  }

  try {
    // Validate item_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(item_id)) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "Invalid item_id format. Must be a valid ObjectId."
          )
        );
    }

    let model;
    switch (category) {
      case "artist":
        model = Artist;
        break;
      case "album":
        model = Album;
        break;
      case "track":
        model = Track;
        break;
    }
    const item = await model.findById(item_id);
    if (!item) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            null,
            `Item with ID ${item_id} not found in ${category} category.`
          )
        );
    }

    // Check for duplicates
    const existingFavorite = await Favourite.findOne({ user: userId, item_id });
    if (existingFavorite) {
      return res
        .status(409)
        .json(
          new ApiResponse(409, null, "This item is already in your favorites.")
        );
    }

    await Favourite.create({
      user: userId,
      category,
      item_id,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(201, null, "Item added to favorites successfully.")
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error." + error));
  }
});

const deleteFavorite = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    // Validate item_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "Invalid item_id format. Must be a valid ObjectId."
          )
        );
    }

    const favorite = await Favourite.findOne({ _id: id, user: userId });
    if (!favorite) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            null,
            "Favorite not found or does not belong to the user."
          )
        );
    }

    await favorite.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Favorite removed successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error." + error));
  }
});

export { getFavorites, addFavroite, deleteFavorite };
