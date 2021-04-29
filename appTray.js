const path = require("path");
const { app, Menu, Tray } = require("electron");

class AppTray {
  constructor(mainWindow) {
    const trayIconPath = path.join(
      __dirname,
      "assets",
      "icons",
      "tray_icon.png"
    );
    this._tray = Tray(trayIconPath);
    this._mainWindow = mainWindow;
  }

  setTrayContextMenu() {
    this._tray.setContextMenu(this.getContextMenu());
  }

  getContextMenu() {
    const hideShowLabel = `${
      this._mainWindow.isVisible() ? "Hide" : "Show"
    } SysTop`;
    const hideShowClickFn = this._mainWindow.isVisible()
      ? this.hideWindow.bind(this)
      : this.showWindow.bind(this);

    return Menu.buildFromTemplate([
      { label: hideShowLabel, click: hideShowClickFn },
      { type: "separator" },
      {
        label: "Quit SysTop",
        click: () => {
          app.quittingFromTray = true;
          app.quit();
        },
      },
    ]);
  }

  hideWindow() {
    this._mainWindow.hide();
    this.setTrayContextMenu();
  }

  showWindow() {
    this._mainWindow.show();
    this.setTrayContextMenu();
  }
}

module.exports = AppTray;
