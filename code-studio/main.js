import { Command } from "commander";
import { registerCommand } from "./registerCommand.js";

const run = async () => {
  const program = new Command();
  program.name("concours").description(`CLI to display QR code & token`);

  program.addCommand(registerCommand);

  await program.parseAsync(process.argv);

  if (!program.args.length) {
    program.help();
  }
};

(async () => {
  try {
    await run();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
