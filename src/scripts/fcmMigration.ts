import FcmMongo from '@models/mongoose/fcm.model';
import dbSequelize from '@models/sequelize';
import dbMongo from '@models/mongoose';
import State from '@/models/mongoose/state.model';
import District from '@/models/mongoose/district.model';
import Fcm from '@/models/sequelize/fcm.model';

dbMongo();

const exec = async () => {
  const successIds = [];
  const failedIds = [];

  try {
    const fcmsQuery = await dbSequelize.query('SELECT * from fcm limit 100');
    const fcms = fcmsQuery[0] as Fcm[];

    console.log('Total fcms------------', fcms.length);

    const promises = fcms.map(async (fcm, i) => {
      const state = fcm.state.trim();
      const district = fcm.dist.trim();

      const oldState = await State.findOne({ name: state, isOld: true });
      const oldDistrict = await District.findOne({ name: district, state: oldState?._id, isOld: true });

      let setStateSuccess = true;
      let setDistrictSuccess = true;

      if (fcm.state && fcm.state !== 'other' && !oldState) {
        setStateSuccess = false;
      }

      if (fcm.dist && fcm.dist !== 'other' && !oldDistrict) {
        setDistrictSuccess = false;
      }

      if (!(setStateSuccess && setDistrictSuccess)) {
        console.log(oldState, oldDistrict, state, district);
        failedIds.push(i);
        return;
      }

      const data = await FcmMongo.create(
        [
          {
            state: oldState?._id,
            district: oldDistrict?._id,
            fcm_token: fcm.fcm_token,
          },
        ],
        {},
      );

      successIds.push(i);

      if (!data) {
        console.log('Something went wrong, Sequelize fcm id ===>', i);
      }
    });

    await Promise.all(promises);

    console.log('success ids', successIds, successIds.length);
    console.log('failed ids', failedIds, failedIds.length);
  } catch (error) {
    console.log(error);
  } finally {
    process.exit(1);
  }
};

exec();
