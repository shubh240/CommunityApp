import mongoose from 'mongoose';
import db from '@models/mongoose';
import State from '@/models/mongoose/state.model';
import District from '@/models/mongoose/district.model';
import { stateDistBlockMap } from '@/constants/stateDistBlockMap';
import { logger } from '@/utils/logger';

(async () => {
  await db();
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const states = await State.find({ isOld: false });

    for (const state of states) {
      const districts = stateDistBlockMap[state.name]?.district;

      const districtsArr = Object.keys(districts);
      for (const district of districtsArr) {
        if (district.toLowerCase() === 'other') {
          break;
        }
        await District.findOneAndUpdate(
          { name: district, state: state._id, isOld: false },
          {
            $set: {
              name: district,
              state: state._id,
              code: districts?.[district]?.dist_code,
              isOld: false,
              isActive: true,
            },
          },
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
