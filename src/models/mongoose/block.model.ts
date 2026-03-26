import mongoose, { Schema } from 'mongoose';
import { BlockAttributes } from './interfaces/block.model.interface';

const blockSchema = new Schema<BlockAttributes>(
  {
    blockerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    blockedId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

blockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });

const Block = mongoose.model<BlockAttributes>('Block', blockSchema);

export default Block;
