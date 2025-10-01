import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // password hidden by default
    },
    userRole: {
      type: String,
      enum: ["customer", "admin", "manager", "cashier"],
      default: "customer",
    },
    customerId: {
      type: Number,

    },
    DOB: {
      type: Date,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetCode: { type: String },
    resetCodeExpiration: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Virtual field to alias `_id` as `userID`
UserSchema.virtual("userID").get(function () {
  return this._id.toHexString();
});

UserSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

// Compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", UserSchema);

export default User;
