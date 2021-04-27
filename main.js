const path = require("path");
const { app, BrowserWindow, Menu } = require("electron");

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
