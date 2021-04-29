const path = require("path");
const { app, BrowserWindow, Menu, ipcMain, Tray } = require("electron");

const MainWindow = require("./mainWindow");
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

  const trayIcon = path.join(__dirname, "assets", "icons", "tray_icon.png");
  tray = new Tray(trayIcon);
  setTrayContextMenu();
  const mainWindowBackup = mainWindow;
  mainWindow.on("close", (event) => {
    if (!app.quittingFromTray) {
      mainWindow = mainWindowBackup;
      mainWindow.hide();
      setTrayContextMenu();
      event.preventDefault();
    }
  });
});

const setTrayContextMenu = () => {
  let hideShowLabel;
  let hideShowClickFn;
  if (mainWindow.isVisible()) {
    hideShowLabel = "Hide SysTop";
    hideShowClickFn = () => {
      mainWindow.hide();
      setTrayContextMenu();
    };
  } else {
    hideShowLabel = "Show SysTop";
    hideShowClickFn = () => {
      mainWindow.show();
      setTrayContextMenu();
    };
  }

  const trayMenu = Menu.buildFromTemplate([
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
  tray.setContextMenu(trayMenu);
};

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
