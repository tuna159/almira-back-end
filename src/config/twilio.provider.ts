import { Provider } from '@nestjs/common';
import * as twilio from 'twilio';

export const TWILIO_PROVIDER = 'Twilio';

export const twilioProvider: Provider = {
  provide: TWILIO_PROVIDER,
  useFactory: () => {
    return twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  },
};
