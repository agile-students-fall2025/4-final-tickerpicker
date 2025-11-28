import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // for user specific notifications
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },

    symbol: {
      type: String,
      uppercase: true,
      trim: true,
      index: true,
    },

    // earnings / dividend / test / communication
    eventType: {
      type: String,
      enum: ["earnings", "dividend", "test", "communication"],
      default: "other",
    },

    eventDate: {
      type: Date,
    },

    daysUntil: {
      type: Number,
    },

    amount: {
      type: Number, // for dividend notifications
    },

    message: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

// So front-end can still use `id` instead of `_id`
notificationSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    // ret._id is ObjectId; keep string id and remove _id
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

// change json output to current mock data 
notificationSchema.set("toJSON", {
    versionKey: false,  // drop __v
    transform: (_, ret) => {
      // expose id instead of _id for frontend
      ret.id = ret._id.toString();
      delete ret._id;
    },
  });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
