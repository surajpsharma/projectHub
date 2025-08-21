import mongoose, { Schema, InferSchemaType, models, model } from "mongoose";

const FeedbackSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: false, trim: true, lowercase: true },
    message: { type: String, required: true, maxlength: 2000 },
    rating: { type: Number, min: 1, max: 5 },
    user: { type: Schema.Types.ObjectId, ref: "Author" },
  },
  { timestamps: { createdAt: "_createdAt", updatedAt: "_updatedAt" } }
);

export type FeedbackDoc = InferSchemaType<typeof FeedbackSchema> & {
  _id: string;
};

export default models.Feedback || model("Feedback", FeedbackSchema);
