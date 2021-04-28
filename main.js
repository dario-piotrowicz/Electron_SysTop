const path = require("path");
const { app, BrowserWindow, Menu, ipcMain } = require("electron");

const Store = require("./store");

process.env.NODE_ENV = "development";

const isDev = process.env.NODE_ENV !== "production";

const store = new Store({
  settings: {
    cpuOverloadThreshold: 80,
    alertFrequencyInMinutes: 5,
  },
});

let mainWindow;

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    title: "SysTop",
    width: 355,
    height: 500,
    resizable: isDev,
    icon: `${__dirname}/assets/icons/icon.png`,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(`${__dirname}/app/index.html`);
};

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
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
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
  return [
    {
      role: "FileMenu",
    },
    ...devMenu,
  ];
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
