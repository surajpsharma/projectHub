import mongoose, { Schema, InferSchemaType, models, model } from "mongoose";

const PlaylistSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    select: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  },
  { timestamps: { createdAt: "_createdAt", updatedAt: "_updatedAt" } }
);

export type PlaylistDoc = InferSchemaType<typeof PlaylistSchema> & {
  _id: string;
};

export default models.Playlist || model("Playlist", PlaylistSchema);
