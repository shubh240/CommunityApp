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
  try {
    const users = await (<ModelCtor<User>>dbSequelize.models.User).findAll({
      where: {
        id: {
          [Op.in]: [
            420, 699, 797, 863, 1925, 2077, 2429, 2481, 2944, 3743, 3851, 3948, 4321, 4814, 6284, 6503, 6502, 6776,
            6725, 6878, 7082, 7550, 7576, 7827, 7966, 8229, 8213, 8284, 8294, 8349, 8421, 8329, 8420, 8327, 8361, 8490,
            8486, 8690, 8857, 9078, 9251, 10992, 12030, 12119, 12722, 12952,
          ],
        },
      },
    });
    console.log('Total users------------', users.length);

    await Promise.all(
      users.map(async (user) => {
        const adminState = user.state.trim();
        const adminDistrict = user.dist.trim();

        const oldState = await State.findOne({ name: adminState, isOld: true });
        const adminDistrictEscaped = adminDistrict.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
        const oldDistrict = await District.findOne({
          name: new RegExp(`^${adminDistrictEscaped}`, 'i'),
          state: oldState?._id,
          isOld: true,
        });

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
  } catch (error) {
    console.log(error);
  } finally {
    process.exit(1);
  }
};

exec();
