import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'mentor', 'admin'],
      default: 'student',
    },
    avatar: {
      type: String,
      default: "",
    },
    twoFactorSecret: {
      type: String,
      default: "",
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    biometricEnabled: {
      type: Boolean,
      default: false,
    },
    biometricType: {
      type: String,
      enum: ["fingerprint", "face", "iris", ""],
      default: "",
    },
    sessionTimeout: {
      type: Number,
      default: 30, // 0 means never
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const UserModel = mongoose.model('UserModel', userSchema);

export default UserModel;
