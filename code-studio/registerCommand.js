import React from "react";
import { render } from "ink";
//import {CodeDisplay} from './CodeDisplay.jsx';
import QRCode from "qrcode";
import { Command } from "commander";
import { authenticator } from "otplib";

export const registerCommand = new Command("register")
  .description("display it")
  .action(() => {
    let tempToken = "";
    setInterval(() => {
      const token = authenticator.generate(process.env["SECRET"]);
      const timeLeft = authenticator.timeRemaining();
      if (tempToken !== token) {
        process.stdout.write("\n\n\n");
        process.stdout.write(`Code: ${token}\n\n`);
        QRCode.toString(
          `${process.env["URL_REGISTER"]}?code=${token}`,
          { type: "terminal" },
          function (err, QRcode) {
            if (err) return process.stderr.write("error occurred");

            process.stdout.write(QRcode);
            process.stdout.write("\n");
          }
        );
      }
      tempToken = token;
      process.stdout.write(`${timeLeft}s | `);
    }, 1000);
  });
