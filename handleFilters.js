import { neru } from "neru-alpha";

export const DB_TABLENAME_WHITELIST = "DB_WHITELIST";
const FORBIDDEN_WORDS = ["undefined", "null", "{", "}", "{||}", "|"];
const GSM_REGEX =
  "^[A-Za-z0-9 \\r\\n@£$¥èéùìòÇØøÅå\u0394_\u03A6\u0393\u039B\u03A9\u03A0\u03A8\u03A3\u0398\u039EÆæßÉ!\"#$%&'()*+,\\-./:;<=>?¡ÄÖÑÜ§¿äöñüà^{}\\\\\\[~\\]|\u20AC]*$";
const GSM_EXTENDED_REGEX = /\€|\^|\{|\}|\[|\]|\~|\|/g;
const ALLOWED_LENGTH = 160;

// this checks if a phone number is part of the whitelist table
export const isWhitelisted = async (phone) => {
  try {
    const db = neru.getInstanceState();
    const whitelist = (await db.hgetall(DB_TABLENAME_WHITELIST)) || [];
    console.log(whitelist);
    if (whitelist.indexOf(phone) !== -1) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.error("Whitelist check error: ", e);
    return false;
  }
};

// this checks if a message body contains any unwated words or characters
export const isPassingContentFilter = (messageBody) => {
  try {
    const isContainingBlockedWord = FORBIDDEN_WORDS.some(
      (e) => messageBody.indexOf(e) !== -1
    );
    return !isContainingBlockedWord;
  } catch (e) {
    console.error("Content filter error: ", e);
    return false;
  }
};

// this checks if the message body onyl coantians GSM7 characters
export function isGSMAlphabet(text) {
  var regexp = new RegExp(GSM_REGEX);
  return regexp.test(text);
}

// this checks is the messge is maximum 160 characters lonf, taking into account that special characters of the GSM7 set will take up 2 characters
export const isPassingLengthCheck = (messageBody) => {
  let msgLength = messageBody.length;
  let specialCharDoubleLength = (messageBody.match(GSM_EXTENDED_REGEX) || [])
    .length;
  let totalLength = msgLength + specialCharDoubleLength;
  console.log("total length: ", totalLength);
  if (totalLength <= ALLOWED_LENGTH) {
    return true;
  } else {
    return false;
  }
};
