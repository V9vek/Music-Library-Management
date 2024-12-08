import mongoose, { Schema } from "mongoose";

const TrackSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Track name is required"],
    },
    duration: {
      type: Number, // seconds
      required: true,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
    album: {
      type: Schema.Types.ObjectId,
      ref: "Album",
    },
    artist: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
    },
  },
  { timestamps: true }
);

export const Track = mongoose.model("Track", TrackSchema);
