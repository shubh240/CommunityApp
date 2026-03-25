import mongoose from 'mongoose';
import db from '@models/mongoose';
import State from '@/models/mongoose/state.model';
import District from '@/models/mongoose/district.model';
import { stateDistBlockMap } from '@/constants/stateDistBlockMap';
import { logger } from '@/utils/logger';
import Block from '@/models/mongoose/block.model';

(async () => {
  await db();
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const states = await State.find({ isOld: false });

    const promises = states.map(async (state) => {
      const districts = await District.find({ isOld: false, state: state._id });

      return Promise.all(
        districts.map(async (district) => {
          const districtName = district.name;
          const stateName = state.name;
          const blocks = stateDistBlockMap?.[stateName]?.district?.[districtName]?.blocks;

          return Promise.all(
            blocks.map(async (block) => {
              if (block.block_name.toLowerCase() === 'other') {
                return;
              }
              await Block.findOneAndUpdate(
                { name: district, state: state._id, isOld: false },
                {
                  $set: {
                    name: block.block_name,
                    localName: block.block_name_local,
                    state: state._id,
                    district: district._id,
                    code: block.block_code,
                    isOld: false,
                    isActive: true,
                  },
                },
                { session, upsert: true },
              );

              console.log('added ->', state.name, district.name, block.block_name);
            }),
          );
        }),
      );
    });

    await Promise.all(promises);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    // If an error occurs, abort the transaction
    await session.abortTransaction();
    session.endSession();
    console.log(error);
  } finally {
    logger.info('Blocks added successfully');
    process.exit();
  }
})();
