import { spawn } from "child_process";
import("./app.js");

let child;

const startServer = () => {
  console.log('Starting bot...');
  child = spawn('node', ['index.js'], { stdio: 'inherit' })
    .on('exit', (code, signal) => {
      console.log(`Server process exited with code ${code} and signal ${signal}`);
      if (code !== 0) {
        console.log('Restarting bot...');
        startServer();
      } else {
        console.log('Stopping bot...');
        process.exit();
      }
    });
};

startServer();

process.on('SIGINT', () => (console.log('Stopping bot...'), child.kill('SIGINT'), process.exit()));
