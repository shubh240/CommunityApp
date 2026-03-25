import { stateDistMap } from '@/constants/stateDistMap';
import State from '@/models/mongoose/state.model';
import connectMongoDB from '@/models/mongoose';
import mongoose from 'mongoose';
import { logger } from '@/utils/logger';

(async () => {
  await connectMongoDB();
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const states = Object.keys(stateDistMap);

    await Promise.all(
      states.map((state) => {
        if (state.toLowerCase() === 'other') {
          return;
        }
        return State.findOneAndUpdate(
          { name: state, isOld: true },
          { $set: { name: state, isOld: true, isActive: true } },
          { session, upsert: true },
        );
      }),
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    // If an error occurs, abort the transaction
    await session.abortTransaction();
    session.endSession();
    console.log(error);
  } finally {
    logger.info('States added successfully');
    process.exit();
  }
})();
