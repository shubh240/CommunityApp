import { ModelCtor } from 'sequelize-typescript';
import dbSequelize from '@models/sequelize';
import dbMongo from '@models/mongoose';
import User from '@/models/sequelize/user.model';
import State from '@/models/mongoose/state.model';
import District from '@/models/mongoose/district.model';
import UserMongo from '@/models/mongoose/user.model';
import { Op } from 'sequelize';

dbMongo();

const exec = async () => {
  const successIds = [];
  const failedIds = [];
  const skipDueToMobileNotFound = [];
  try {
    const users = await (<ModelCtor<User>>dbSequelize.models.User).findAll({
      // where: {
      //   id: {
      //     [Op.lt]: 100,
      //   },
      // },
    });
    console.log('Total users------------', users.length);

    await Promise.all(
      users.map(async (user) => {
        // console.log('Executing id ->', user.id);

        if (!user.mobileno) {
          console.log('Continued due to mobile not found');
          skipDueToMobileNotFound.push(user.id);
          return;
        }

        const adminState = user.state.trim();
        const adminDistrict = user.dist.trim();

        const oldState = await State.findOne({ name: adminState, isOld: true });
        const oldDistrict = await District.findOne({ name: adminDistrict, state: oldState?._id, isOld: true });

        let setStateSuccess = true;
        let setDistrictSuccess = true;

        if (user.state && user.state !== 'other' && !oldState) {
          setStateSuccess = false;
        }
        if (user.dist && user.dist !== 'other' && !oldDistrict) {
          setDistrictSuccess = false;
        }

        if (!(setStateSuccess && setDistrictSuccess)) {
          failedIds.push(user.id);
          return;
        }

        const data = await UserMongo.create(
          [
            {
              firstName: user.fname,
              lastName: user.lname,
              mobile: user.mobileno,
              email: user.email,
              address: user.address,
              pincode: user.pincode,
              state: oldState?._id,
              district: oldDistrict?._id,
              oldSqlId: user.id,
            },
          ],
          {},
        );

        successIds.push(user.id);

        if (!data) {
          console.log('Something went wrong, Sequelize admin id ===>', user.id);
          return;
        }
      }),
    );

    console.log('success ids', successIds, successIds.length);
    console.log('failed ids', failedIds, failedIds.length);
    console.log('Skip due to mobile not found ids', skipDueToMobileNotFound, skipDueToMobileNotFound.length);
  } catch (error) {
    console.log(error);
  } finally {
    process.exit(1);
  }
};

const checkExistance = async () => {
  try {
    const user = await (<ModelCtor<User>>dbSequelize.models.User).findAll({});

    const states = user.map((user) => user.state).filter((state) => state);
    const uniqueState = new Set([...states]);
    const uniqueStateArray = [...uniqueState];

    const district = user.map((user) => user.dist).filter((district) => district);
    const uniqueDistrict = new Set([...district]);
    const uniqueDistrictArray = [...uniqueDistrict];

    console.log(uniqueStateArray);
    console.log(uniqueDistrictArray);
  } catch (error) {
    console.log(error);
  } finally {
    process.exit(1);
  }
};

exec();
