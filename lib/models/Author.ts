import mongoose, { Schema, InferSchemaType, models, model } from "mongoose";

const AuthorSchema = new Schema(
  {
    providerId: { type: String, index: true },
    provider: { type: String, enum: ["github", "google"], index: true },
    name: String,
    username: { type: String, index: true },
    email: { type: String, index: true },
    image: String,
    bio: String,
    instagram: String,
  },
  { timestamps: { createdAt: "_createdAt", updatedAt: "_updatedAt" } }
);

export type AuthorDoc = InferSchemaType<typeof AuthorSchema> & { _id: string };

export default models.Author || model("Author", AuthorSchema);
