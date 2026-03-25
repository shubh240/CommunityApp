import twilio from 'twilio';
import AWS from 'aws-sdk';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER!;

AWS.config.update({ region: process.env.AWS_REGION! });

export const sendOtpSms = async (mobile: string, otp: string, provider: 'twilio' | 'aws' = 'twilio') => {
  try {
    if (provider === 'twilio') {
      const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: `Your OTP is ${otp}`,
        from: TWILIO_PHONE_NUMBER,
        to: mobile
      });
    } else if (provider === 'aws') {
      const sns = new AWS.SNS();
      await sns.publish({
        Message: `Your OTP is ${otp}`,
        PhoneNumber: mobile
      }).promise();
    }
    console.log(`OTP sent to ${mobile} via ${provider}`);
  } catch (err) {
    console.error(`Failed to send OTP via ${provider}:`, err);
  }
};
