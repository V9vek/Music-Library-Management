import mongoose, { Schema } from "mongoose";

const ArtistSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Artist name is required"],
    },
    grammy: {
      type: Boolean,
      default: false,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Artist = mongoose.model("Artist", ArtistSchema);
