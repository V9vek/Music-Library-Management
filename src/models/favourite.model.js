import mongoose, { Schema } from "mongoose";

const FavouriteSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: ["artist", "album", "track"],
      required: true,
    },
    item_id: {
      type: Schema.Types.ObjectId,
      required: true, // ID of the artist, album, or track
    },
  },
  { timestamps: true }
);

export const Favourite = mongoose.model("Favourite", FavouriteSchema);
