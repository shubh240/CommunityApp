import { ModelCtor } from 'sequelize-typescript';
import AdminSequelize from '@models/sequelize/admin.model';
import AdminMongo from '@models/mongoose/admin.model';
import dbSequelize from '@models/sequelize';
import dbMongo from '@models/mongoose';
import State from '@/models/mongoose/state.model';
import District from '@/models/mongoose/district.model';
import { oldNewDistMap } from '@/constants/oldNewDistMap';
import { oldNewStateMap } from '@/constants/oldNewStateMap';
import { RESPONSIBILITY } from '@/models/mongoose/interfaces/admin.model.interface';
import { encryptPassword } from '@/utils/auth';

const getResponsibility = (admin: AdminSequelize) => {
  if (admin.state === 'other' && admin.dist === 'other') {
    return RESPONSIBILITY.NATIONAL;
  } else if (admin.dist === 'other') {
    return RESPONSIBILITY.STATE;
  } else {
    return RESPONSIBILITY.DISTRICT;
  }
};

const exec = async () => {
  await dbMongo();

  const successIds = [];
  const failedIds = [];
  const skipDueToMobileNotFound = [];

  try {
    const admins = await (<ModelCtor<AdminSequelize>>dbSequelize.models.Admin).findAll({});

    console.log('Total admins------------', admins.length);
    for (let i = 0; i < admins.length; i++) {
      const admin = admins[i];
      console.log('Executing id ->', admin.id);

      if (!admin.mobileno) {
        console.log('Continued due to mobile not found');
        skipDueToMobileNotFound.push(admin.id);
        continue;
      }

      const adminState = admin.state.trim();
      const adminDistrict = admin.dist.trim();
      const adminEmail = admin.email.trim();

      const newState = await State.findOne({ name: oldNewStateMap[adminState], isOld: false });
      const newDistrict = await District.findOne({
        name: oldNewDistMap[adminDistrict],
        state: newState?._id,
        isOld: false,
      });

      const oldState = await State.findOne({ name: adminState, isOld: true });
      const oldDistrict = await District.findOne({ name: adminDistrict, state: oldState?._id, isOld: true });

      // console.log(newState, newDistrict, adminState, adminDistrict);
      // console.log(oldState, oldDistrict, oldNewStateMap[adminState], oldNewDistMap[adminDistrict]);
      let setStateSuccess = true;
      let setDistrictSuccess = true;

      if (admin.state && admin.state !== 'other' && (!oldState || !newState)) {
        setStateSuccess = false;
      }
      if (admin.dist && admin.dist !== 'other' && (!oldDistrict || !newDistrict)) {
        setDistrictSuccess = false;
      }

      if (!(setStateSuccess && setDistrictSuccess)) {
        failedIds.push(admin.id);
        continue;
      }

      const encrpytedPassword = await encryptPassword(admin.pass);
      const data = await AdminMongo.create(
        [
          {
            firstName: admin.fname || '',
            lastName: admin.lname || '',
            mobile: admin.mobileno || '',
            email: adminEmail ? adminEmail : `${admin.fname}-${admin.lname}${admin.id}@hinduhelpline.in`,
            state: newState?._id || null,
            district: newDistrict?._id || null,
            oldState: oldState?._id || null,
            oldDistrict: oldDistrict?._id || null,
            encry_password: encrpytedPassword || null,
            responsibility: getResponsibility(admin),
            isActive: true,
          },
        ],
        {},
      );

      successIds.push(admin.id);

      if (!data) {
        console.log('Something went wrong, Sequelize admin id ===>', admin.id);
        break;
      }
    }
    console.log('success ids', successIds, successIds.length);
    console.log('failed ids', failedIds, failedIds.length);
    console.log('Skip due to mobile not found ids', skipDueToMobileNotFound, skipDueToMobileNotFound.length);
  } catch (error) {
    console.log(error);
  } finally {
    process.exit(1);
  }
};

exec();
