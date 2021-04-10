require("update-electron-app")({
  logger: require("electron-log"),
});

const path = require("path");
const glob = require("glob");
const { app, BrowserWindow, Tray, Menu } = require("electron");
const ipcMain = require("electron").ipcMain;

const debug = /--debug/.test(process.argv[2]);

if (process.mas) app.setName("桌面定时闹钟");

let trayOn = false;
let appIcon = null;
let mainWindow = null;

function initialize() {
  makeSingleInstance();

  loadDemos();

  function createWindow() {
    const windowOptions = {
      width: 1080,
      minWidth: 680,
      height: 600,
      title: app.getName(),
      webPreferences: {
        nodeIntegration: true,
      },
    };

    if (process.platform === "linux") {
      windowOptions.icon = path.join(__dirname, "/assets/app-icon/png/512.png");
    }

    mainWindow = new BrowserWindow(windowOptions);
    mainWindow.loadURL(path.join("file://", __dirname, "/index.html"));

    // 在打开 DevTools 的情况下全屏启动, 用法: npm run debug
    if (debug) {
      mainWindow.webContents.openDevTools();
      mainWindow.maximize();
      require("devtron").install();
    }

    mainWindow.on("close", (e) => {
      if (trayOn) {
        e.preventDefault();
        mainWindow.hide();
      }
    });
    mainWindow.on("closed", () => {
      mainWindow = null;
    });
  }

  ipcMain.on("hide-main-window", function () {
    mainWindow.hide();
  });

  app.on("ready", () => {
    createWindow();
  });

  app.on("window-all-closed", () => {
    // 苹果禁止监听此事件
    if (process.platform !== "darwin" && !trayOn) {
      if (appIcon) appIcon.destroy();
      app.quit();
    }
  });

  app.on("activate", () => {
    if (mainWindow === null) {
      createWindow();
    }
  });

  // app.on("before-quit", (e) => {
  //   if (trayOn) {
  //     e.preventDefault();
  //     mainWindow.hide();
  //   }
  // });

  app.on("will-quit", (e) => {
    mainWindow = null;
  });

  // 系统托盘图标
  ipcMain.on("put-in-tray", (event) => {
    trayOn = true;

    const iconName =
      process.platform === "win32" ? "windows-icon.png" : "iconTemplate.png";
    const iconPath = path.join(__dirname, `/assets/img/tray/${iconName}`);
    appIcon = new Tray(iconPath);
    appIcon.setToolTip("桌面定时闹钟");
    appIcon.on("click", () => {
      mainWindow.show();
      mainWindow.focus();
    });
    appIcon.on("right-click", () => {
      var contextMenu = Menu.buildFromTemplate([
        {
          label: "退出系统",
          click: function () {
            appIcon.destroy();
            trayOn = false;
            app.quit();
          },
        },
      ]);
      appIcon.setContextMenu(contextMenu);
    });
  });

  ipcMain.on("remove-tray", () => {
    trayOn = false;

    if (appIcon) appIcon.destroy();
  });
}

// 将此应用程序设为单个实例应用程序。
//
// 当尝试启动第二个实例时，将恢复并聚焦到主窗口，
// 而不是打开第二个窗口。
//
// 如果应用程序的当前版本应该退出而不是启动，
// 则返回true.
function makeSingleInstance() {
  if (process.mas) return;

  app.requestSingleInstanceLock();

  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// 在主进程目录中需要的每个 JS 文件
function loadDemos() {
  const files = glob.sync(path.join(__dirname, "main-process/**/*.js"));
  files.forEach((file) => {
    require(file);
  });
}

initialize();
