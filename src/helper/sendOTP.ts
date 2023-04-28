import * as twilio from 'twilio';

// Initialize the Twilio client
const accountSid = 'AC0eefefca22127faddf72bff0b61408dd';
const authToken = 'ced833d485035c9f6e261b43555ae505';
const client = twilio(accountSid, authToken);

// Send a text message

export default function sendOTP(to: string, otp: number) {
  client.messages
    .create({
      body: `Your OTP is ${otp}. Please enter it to verify your account.`,
      to: '+84' + to, // Your phone number
      from: '+17743415876', // Your Twilio phone number
    })
    .then((message) => console.log(`Message sent with ID ${message.sid}`))
    .catch((error) => console.log(`Error sending message: ${error}`));
}
