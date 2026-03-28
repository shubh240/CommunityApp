import UserDeviceToken from '@/models/mongoose/userDeviceToken.model';
import Notification from '@/models/mongoose/notification.model';
import { sendUserPushNotification } from '@/services/pushNotification';
import { logger } from '@/utils/logger';

interface PushPayload {
  senderId?: any;
  receiverId: any;
  type: string;
  referenceId?: any;
  title: string;
  message: string;
}

/**
 * Creates a notification record in DB AND sends push notification to user's devices.
 * Use this everywhere instead of directly creating Notification + calling push separately.
 */
export const sendNotification = async (payload: PushPayload) => {
  try {
    // 1. Save notification to DB
    await Notification.create({
      senderId: payload.senderId || null,
      receiverId: payload.receiverId,
      type: payload.type,
      referenceId: payload.referenceId || null,
      title: payload.title,
      message: payload.message,
    });

    // 2. Get user's active device tokens
    const deviceTokens = await UserDeviceToken.find({
      userId: payload.receiverId,
      isActive: true,
    }).select('token').lean();

    if (deviceTokens.length === 0) return;

    const tokens = deviceTokens.map(d => d.token);

    // 3. Send push notification via Firebase
    await sendUserPushNotification(tokens, payload.title, payload.message);
  } catch (error) {
    // Push notification failure should not break the app flow
    logger.error('[Push Notification] Error:', error);
  }
};
