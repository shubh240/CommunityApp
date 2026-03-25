import admin from 'firebase-admin';
import user from 'firebase-admin';
import serviceAccountKey from '@/config/serviceAccountKey.json';
import serviceAccountKeyAdmin from '@/config/serviceAccountKeyAdmin.json';

// Initialize the first app instance with a unique name
const firebaseAdminForUserInstance = admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccountKey as any),
  },
  'userApp',
);

// Initialize the second app instance with a different unique name
const firebaseAdminForAdminInstance = user.initializeApp(
  {
    credential: user.credential.cert(serviceAccountKeyAdmin as any),
  },
  'adminApp',
);

export const sendUserPushNotification = async (devicePushTokens: string[], title: string, body: string) => {
  try {
    await Promise.all(
      devicePushTokens.map((devicePushToken) =>
        firebaseAdminForUserInstance.messaging().send({
          token: devicePushToken,
          notification: {
            title,
            body,
          },
        }),
      ),
    );
  } catch (err) {
    console.log(err);
  }
};

export const sendAdminPushNotification = async (devicePushTokens: string[], title: string, body: string) => {
  try {
    await Promise.all(
      devicePushTokens.map((devicePushToken) =>
        firebaseAdminForAdminInstance.messaging().send({
          token: devicePushToken,
          notification: {
            title,
            body,
          },
        }),
      ),
    );
  } catch (err) {
    console.log(err);
  }
};
