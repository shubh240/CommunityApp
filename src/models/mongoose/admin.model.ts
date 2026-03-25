import mongoose, { Schema, Document } from 'mongoose';
import { AdminAttributes } from './interfaces/admin.model.interface';

const adminSchema = new Schema<AdminAttributes>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobile : {
      type : Number,
      required:true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
      select: false, // 🔐 never return password
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.model<AdminAttributes>('Admin', adminSchema);
export default Admin;
