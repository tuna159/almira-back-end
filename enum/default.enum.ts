export enum EGender {
  NOT_SELECT = -1,
  PREFER_NOT_TO_SAY = 0,
  MALE = 1,
  FEMALE = 2,
}

export enum EActivityType {
  COMMENT = 0,
  LIKE_POST = 1,
  LIKE_COMMENT = 2,
}

export enum EReadMessageStatus {
  UN_READ = 0,
  READED = 1,
}

export enum EMessageWho {
  SENT = 'message_sent',
  Received = 'message_received',
}

export enum ELastMessageEmpty {
  SENT = 'Sent image(s)',
  RECEIVED = 'Received image(s)',
}

export enum EGiftTypeID {
  SEND_GIFT = 1,
}

export enum EPointsAdded {
  SEND_GIFT = 50,
}
