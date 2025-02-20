import { authenticator } from "otplib";
import axios from "axios";

export const handler = async (event, context, callback) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  if (!event["authorizationToken"]) {
    return callback("Unauthorized");
  }

  const totpCode = event["authorizationToken"];

  let base32secret = "";
  try {
    const response = await axios.get(
      "http://localhost:2773/systemsmanager/parameters/get?name=secret_key_concours&withDecryption=true",
      {
        headers: {
          "X-Aws-Parameters-Secrets-Token": process.env["AWS_SESSION_TOKEN"],
        },
      }
    );
    base32secret = response.data.Parameter.Value;
  } catch (error) {
    console.log(error);
    return callback("Unauthorized");
  }

  try {
    const isValid = authenticator.verify({
      token: totpCode,
      secret: base32secret,
    });
    if (!isValid) {
      return callback("Unauthorized");
    }

    return callback(null, generateAllow("me", event.methodArn));
  } catch (err) {
    console.error(err);
    return callback("Unauthorized");
  }
};

// Help function to generate an IAM policy
let generatePolicy = function (principalId, effect, resource) {
  // Required output:
  let authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    let policyDocument = {};
    policyDocument.Version = "2012-10-17"; // default version
    policyDocument.Statement = [];
    let statementOne = {};
    statementOne.Action = "execute-api:Invoke"; // default action
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};

let generateAllow = function (principalId, resource) {
  return generatePolicy(principalId, "Allow", resource);
};
