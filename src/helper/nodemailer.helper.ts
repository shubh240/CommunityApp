import nodemailer from 'nodemailer';
import { getEmailTemplate } from './email.helper'; // Import the HTML template

interface IHelp {
    fullName: string;
    mobile: string;
    email: string;
    address: string;
    pincode: string;
    state: string;
    district: string;
    helpCategory: string;
    helpSubCategory: string;
    helpMode: string;
    date: Date;
    block: string;
    description: string;
}

export const sendMail = (data: IHelp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'hinduhelplinegujarat@gmail.com',
      pass: 'srih jodu liog cfzt', // Use App Password instead of Gmail password
    },
  });

  const mailOptions = {
    from: 'Hindu Helpline <hinduhelplinegujarat@gmail.com>',
    to: 'adityapanchal1515@gmail.com',
    subject: `New Help Request - ${data.fullName}`,
    html: getEmailTemplate(data), // Use HTML template instead of plain text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};
