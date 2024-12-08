import mongoose, { Schema } from "mongoose";

const AlbumSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Album name is required"],
    },
    year: {
      type: Number,
      required: true,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
    artist: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
    },
  },
  { timestamps: true }
);

export const Album = mongoose.model("Album", AlbumSchema);
