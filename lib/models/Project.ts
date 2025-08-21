import mongoose, { Schema, InferSchemaType, models, model } from "mongoose";

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String },
    slug: { type: String, required: true, unique: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: "Author", required: true },
    details: { type: String },
    views: { type: Number, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: "Author" }],
  },
  { timestamps: { createdAt: "_createdAt", updatedAt: "_updatedAt" } }
);

export type ProjectDoc = InferSchemaType<typeof ProjectSchema> & {
  _id: string;
};

export default models.Project || model("Project", ProjectSchema);
