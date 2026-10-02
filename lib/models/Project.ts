import mongoose, { Schema, InferSchemaType, models, model } from "mongoose";

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String },
    coverImage: { type: String },
    slug: { type: String, required: true, unique: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: "Author", required: true, index: true },
    creator: { type: Schema.Types.ObjectId, ref: "Author", index: true },
    details: { type: String },
    views: { type: Number, default: 0, index: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "Author", index: true }],
    screenshots: [{ type: String }],
    technologies: [{ type: String, index: true }],
    githubUrl: { type: String },
    liveUrl: { type: String },
    documentationUrl: { type: String },
    status: { type: String, enum: ["Draft", "Published"], default: "Published", index: true },
  },
  { timestamps: { createdAt: "_createdAt", updatedAt: "_updatedAt" } }
);

export type ProjectDoc = InferSchemaType<typeof ProjectSchema> & {
  _id: string;
  _createdAt?: Date;
  _updatedAt?: Date;
};

export default models.Project || model("Project", ProjectSchema);
