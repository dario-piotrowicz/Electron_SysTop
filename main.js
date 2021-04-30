const { app, BrowserWindow, Menu, ipcMain } = require("electron");

const MainWindow = require("./mainWindow");
const AppTray = require("./appTray");
const Store = require("./store");

process.env.NODE_ENV = "production";

const isDev = process.env.NODE_ENV !== "production";

const store = new Store({
  settings: {
    cpuOverloadThreshold: 80,
    alertFrequencyInMinutes: 5,
  },
});

let mainWindow;
let tray;

const createMainWindow = () => (mainWindow = new MainWindow(isDev));

const sendSetSettingToUI = () =>
  mainWindow.webContents.send("set-settings", store.get("settings"));

app.on("ready", () => {
  createMainWindow();
  mainWindow.on("close", () => (mainWindow = null));
  const mainMenu = Menu.buildFromTemplate(getMainTemplateMenu());
  Menu.setApplicationMenu(mainMenu);
  if (isDev) {
    mainWindow.setPosition(2500, 560);
    mainWindow.maximize();
    mainWindow.webContents.openDevTools();
  }
  mainWindow.webContents.on("dom-ready", sendSetSettingToUI);

  tray = new AppTray(mainWindow);
  tray.setTrayContextMenu();
  const mainWindowBackup = mainWindow;
  mainWindow.on("close", (event) => {
    if (!app.quittingFromTray) {
      mainWindow = mainWindowBackup;
      mainWindow.hide();
      tray.setTrayContextMenu();
      event.preventDefault();
    }
  });
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

const getMainTemplateMenu = () => {
  const devMenu = !isDev
    ? []
    : [
        {
          label: "Development",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { type: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ];
  return [...devMenu];
};

ipcMain.on(
  "update-settings",
  (_event, { cpuOverloadThreshold, alertFrequencyInMinutes }) => {
    store.set("settings", {
      cpuOverloadThreshold,
      alertFrequencyInMinutes,
    });
    sendSetSettingToUI();
  }
);
