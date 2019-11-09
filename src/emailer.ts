/* tslint:disable:no-console */

import * as nodemailer from 'nodemailer';
import * as util from 'util';

import { inspect } from './inspect';

const moduleName: string = 'emailer';

const emailFrom: string = process.env.EMAIL_FROM ?
  (process.env.EMAIL_FROM as string) : 'ex-emailer';

const emailHost: string = process.env.EMAIL_HOST ?
  (process.env.EMAIL_HOST as string) : 'smtp.gmail.com';

const emailPassword: string = process.env.EMAIL_PASSWORD ?
  (process.env.EMAIL_PASSWORD as string) : '';

const emailPort: string = process.env.EMAIL_PORT ?
  (process.env.EMAIL_PORT as string) : '';

const emailTo: string = process.env.EMAIL_TO ?
  (process.env.EMAIL_TO as string) : 'Don Bales <don.bales@bounteous.com>';

const emailUsername: string = process.env.EMAIL_USERNAME ?
  (process.env.EMAIL_USERNAME as string) : '';

export function send(emailText: any, subject: string = ''): Promise<any> {
  const methodName: string = 'send';
  console.log(`${moduleName}#${methodName}: Starting...`);

  return new Promise((resolve, reject) => {
    const text: string = emailText && emailText.toString ? emailText.toString() : inspect(emailText);
    // console.log(`${moduleName}#${methodName}: text=\n${text}`);

    const options: any = {};
    options.host = emailHost;
    if (emailUsername && emailPassword) {
      options.auth = {
        pass: emailPassword,
        user: emailUsername
      };
    }
    if (emailPort) {
      options.port = emailPort;
    }

    const transporter: any = nodemailer.createTransport(options);
    // console.log(inspect(transporter));

    const mailOptions: any = {
      from: emailFrom,
      subject,
      text,
      to: emailTo
    };
    // console.log(inspect(mailOptions));

    transporter.sendMail(mailOptions, (err: any, info: any) => {
      if (err) {
        console.error(`${moduleName}#${methodName}: inspect(error)=\n${inspect(err)}`);
        reject(err);
      } else {
        // console.log(`${moduleName}#${methodName}: inspect(info)=${inspect(info)}.`);
        resolve(info);
      }
    });
  });
}

export function sendCallback(emailText: any, subject: string = '', callback: any) {
  const methodName: string = 'send';
  console.log(`${moduleName}#${methodName}: Starting...`);

  const text: string = emailText && emailText.toString ? emailText.toString() : inspect(emailText);
  // console.log(`${moduleName}#${methodName}: text=\n${text}`);

  const options: any = {};
  options.host = emailHost;
  if (emailUsername && emailPassword) {
    options.auth = {
      pass: emailPassword,
      user: emailUsername
    };
  }
  if (emailPort) {
    options.port = emailPort;
  }

  const transporter: any = nodemailer.createTransport(options);
  // console.log(inspect(transporter));

  const mailOptions: any = {
    from: emailFrom,
    subject,
    text,
    to: emailTo
  };
  // console.log(inspect(mailOptions));

  transporter.sendMail(mailOptions, (err: any, info: any) => {
    if (err) {
      console.error(`${moduleName}#${methodName}: inspect(error)=\n${inspect(err)}`);
      callback({ err });
    } else {
      // console.log(`${moduleName}#${methodName}: inspect(info)=${inspect(info)}.`);
      callback({ info });
    }
  });
  callback(emailText);
}
