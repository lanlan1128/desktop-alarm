const { Menu, app } = require("electron");

const debug = /--debug/.test(process.argv[2]);

app.on("ready", () => {
  if (!debug) {
    const menu = Menu.buildFromTemplate([]);
    Menu.setApplicationMenu(menu);
  }
});
