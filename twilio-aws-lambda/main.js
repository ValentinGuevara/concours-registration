const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require("twilio")(accountSid, authToken);

exports.handler = async (event, context) => {
  console.log(event);
  const item = JSON.parse(event.Records[0].body);
  console.log(item);

  try {
    // const message = await client.messages.create({
    //   body: body,
    //   from: process.env.TWILIO_NUMBER,
    //   to: to,
    // });
    return {
      statusCode: 200,
      body: JSON.stringify({}),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};
