import { authenticator } from "otplib";
import qrcode from "qrcode";
import fs from "node:fs";

const secret = authenticator.generateSecret();
console.log(secret);

const otpauth = authenticator.keyuri("admin", "CONCOURS", secret);
qrcode.toDataURL(otpauth, (err, imageUrl) => {
  if (err) {
    console.log("Error with QR");
    return;
  }
  const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
  const filePath = "output_image.png";
  fs.writeFile(filePath, base64Data, "base64", (err) => {
    if (err) {
      console.error("Error writing image file", err);
    } else {
      console.log("Image successfully saved to", filePath);
    }
  });
});

const token = authenticator.generate(secret);
console.log(token);
console.log(authenticator.timeRemaining());

try {
  const isValid = authenticator.verify({
    token,
    secret: process.env["SECRET"],
  });
  console.log(isValid);
} catch (err) {
  console.error(err);
}
