const { BrowserWindow } = require("electron");

class MainWindow extends BrowserWindow {
  constructor(isDev) {
    super({
      title: "SysTop",
      width: 355,
      height: 500,
      show: false,
      resizable: isDev,
      icon: `${__dirname}/assets/icons/icon.png`,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    this.loadFile(`${__dirname}/app/index.html`);
  }
}

module.exports = MainWindow;
