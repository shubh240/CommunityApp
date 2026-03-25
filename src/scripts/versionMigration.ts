import { versions } from '@/constants/version.constant';
import Version from '@/models/mongoose/version.model';
import dbMongo from '@models/mongoose';

const exec = async () => {
  await dbMongo();
  try {
    for (let index = 0; index < versions.length; index++) {
      const version = versions[index];
      await Version.findOneAndUpdate(
        { version: version.version, app: version.app },
        {
          $set: {
            version: version.version,
            deploymentDate: version.deploymentDate,
            releaseDate: version.releaseDate,
            isActive: version.isActive,
            app: version.app,
          },
        },
        { upsert: true },
      );
    }
  } catch (error) {
    console.log(error);
  } finally {
    process.exit(1);
  }
};

exec();
