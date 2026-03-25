import { ModelCtor } from 'sequelize-typescript';
import HelpMongo from '@models/mongoose/help.model';
import dbSequelize from '@models/sequelize';
import dbMongo from '@models/mongoose';
import State from '@/models/mongoose/state.model';
import District from '@/models/mongoose/district.model';
import Help from '@/models/sequelize/help.model';
import { Op } from 'sequelize';
import Admin from '@/models/mongoose/admin.model';
import User from '@/models/mongoose/user.model';
import { HELP_STATUS } from '@/models/mongoose/interfaces/help.model.interface';

dbMongo();

const helpStatusMap = {
  '0': HELP_STATUS.ASKED,
  '1': HELP_STATUS.REVIEWED,
  '2': HELP_STATUS.CLOSED,
};

const exec = async () => {
  const successIds = [];
  const failedIds = [];

  try {
    const helps = await (<ModelCtor<Help>>dbSequelize.models.Help).findAll({
      where: {
        id: {
          [Op.in]: [
            227, 228, 1246, 1426, 1800, 2145, 2265, 2696, 5197, 5715, 1347, 1571, 1855, 1856, 2107, 4663, 4749, 5472,
          ],
        },
      },
    });

    console.log('Total helps------------', helps.length);

    const promises = helps.map(async (help) => {
      console.log('Executing id ->', help.id);

      const state = help.state.trim();
      const district = help.dist.trim();

      const oldState = await State.findOne({ name: state, isOld: true });
      const districtEscaped = district.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
      const oldDistrict = await District.findOne({
        name: new RegExp(`^${districtEscaped}`, 'i'),
        state: oldState?._id,
        isOld: true,
      });

      let setStateSuccess = true;
      let setDistrictSuccess = true;

      if (help.state && help.state !== 'other' && !oldState) {
        setStateSuccess = false;
      }
      if (help.dist && help.dist !== 'other' && !oldDistrict) {
        setDistrictSuccess = false;
      }

      if (!(setStateSuccess && setDistrictSuccess)) {
        failedIds.push(help.id);
        return;
      }

      const admin = await Admin.findOne({ mobile: help.hmob });
      const user = await User.findOne({ oldSqlId: help.uid });

      if (!user) {
        failedIds.push(help.id);
        return;
      }

      const dateString = '25-09-2020';
      const parts = dateString.split('-');
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const dateObj = new Date(year, month, day);

      const data = await HelpMongo.create(
        [
          {
            fullName: help.fullname,
            mobile: help.mobileno,
            email: help.email,
            address: help.address,
            pincode: help.pincode,
            state: oldState._id,
            district: oldDistrict._id,
            helpCategory: help.typehelp,
            helpSubCategory: help.subhelp,
            helpMode: help.helpmode,
            date: dateObj,
            status: helpStatusMap[help.status],
            helperAdmin: admin?._id,
            description: help.hdisc,
            user: user._id,
          },
        ],
        {},
      );

      successIds.push(help.id);

      if (!data) {
        console.log('Something went wrong, Sequelize help id ===>', help.id);
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
