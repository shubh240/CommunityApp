import mongoose from 'mongoose';
import db from '@models/mongoose';
import State from '@/models/mongoose/state.model';
import District from '@/models/mongoose/district.model';
import { stateDistMap } from '@/constants/stateDistMap';
import { logger } from '@/utils/logger';

(async () => {
  await db();
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const states = await State.find({ isOld: true });

    for (const state of states) {
      const districts = stateDistMap[state.name];
      for (const district of districts) {
        if (district.toLowerCase() === 'other') {
          break;
        }
        await District.findOneAndUpdate(
          { name: district, state: state._id, isOld: true },
          { $set: { name: district, state: state._id, isOld: true, isActive: true } },
          { session, upsert: true },
        );
      }
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    // If an error occurs, abort the transaction
    await session.abortTransaction();
    session.endSession();
    console.log(error);
  } finally {
    logger.info('Districts added successfully');
    process.exit();
  }
})();
