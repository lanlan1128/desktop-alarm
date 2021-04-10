const settings = require("electron-settings");

const path = require("path");
const { BrowserWindow, screen } = require("electron").remote;
const ipc = require("electron").ipcMain;

// 定义全局变量
const workTimeSettingMap = {
  workAmStartHour: { default: "09" },
  workAmStartMinute: { default: "00" },
  workAmEndHour: { default: "12" },
  workAmEndMinute: { default: "00" },
  workPmStartHour: { default: "13" },
  workPmStartMinute: { default: "00" },
  workPmEndHour: { default: "18" },
  workPmEndMinute: { default: "00" },
  clockStartHour: { default: "08" },
  clockStartMinute: { default: "55" },
  clockEndHour: { default: "18" },
  clockEndMinute: { default: "00" },
  workRemindMinute: { default: ["30"] },
  workRestMinute: { default: "2", format: false },
  saturdayCheck: { default: false },
  sundayCheck: { default: false },
  bgProcessCheck: { default: true },
};
settings.set("workTimeSettingMap", workTimeSettingMap);

// 获取配置信息
const timeSettings = (function () {
  const returnBean = {};

  returnBean.updateSettings = function () {
    if (!workTimeSettingMap) return;

    for (const key in workTimeSettingMap) {
      const value = workTimeSettingMap[key];

      returnBean[key] =
        settings.get(key) !== undefined ? settings.get(key) : value.default;
    }
  };

  returnBean.updateSettings();

  return returnBean;
})();

// 休息
const btnRest = document.getElementById("btn-alarm-rest");
btnRest.addEventListener("click", function () {
  openRestWindow();
});

// 设置定时器
// setInterval设置1秒触发一次会有掉帧问题。因此需要添加全局变量决定更新分钟的时候触发判断逻辑
let preMinute,
  currentMinuteHasInvoke = false;

updateTime();
setInterval(updateTime, 1000);

function updateTime() {
  const date = new Date();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  const week = date.getDay();

  if (preMinute === undefined || preMinute !== minute) {
    preMinute = minute;
    currentMinuteHasInvoke = false;
  }
  if (currentMinuteHasInvoke) return;

  console.log(`hour: ${hour},minute: ${minute},second: ${second}`);
  currentMinuteHasInvoke = true;
  if (isOverTime(week) || isWorkDay(week)) {
    // 检查提醒;
    checkRestTime(hour, minute);
    checkLunchBreakTime(hour, minute);
    checkClockTime(hour, minute);
  }
}

// 检查是否设置了周末提醒
function isOverTime(week) {
  if (week === 6) {
    return timeSettings["saturdayCheck"];
  } else if (week === 0) {
    return timeSettings["sundayCheck"];
  } else {
    return false;
  }
}

function isWorkDay(week) {
  // 周六和周日是非工作日
  return week !== 6 && week !== 0;
}

// 检查休息提醒
function checkRestTime(hour, minute) {
  const workAmStartHour = Number(timeSettings["workAmStartHour"]);
  const workAmStartMinute = Number(timeSettings["workAmStartMinute"]);
  const workAmEndHour = Number(timeSettings["workAmEndHour"]);
  const workAmEndMinute = Number(timeSettings["workAmEndMinute"]);
  const workPmStartHour = Number(timeSettings["workPmStartHour"]);
  const workPmStartMinute = Number(timeSettings["workPmStartMinute"]);
  const workPmEndHour = Number(timeSettings["workPmEndHour"]);
  const workPmEndMinute = Number(timeSettings["workPmEndMinute"]);
  const workRemindMinute = timeSettings["workRemindMinute"];
  console.log(workRemindMinute);

  if (
    workRemindMinute.find((element) => Number(element) === minute) !== undefined
  ) {
    // 筛选上班时间
    if (
      (hour > workAmStartHour && hour < workAmEndHour) ||
      (hour > workPmStartHour && hour < workPmEndHour) ||
      (hour === workAmStartHour && minute > workAmStartMinute) ||
      (hour === workAmEndHour && minute < workAmEndMinute) ||
      (hour === workPmStartHour && minute > workPmStartMinute) ||
      (hour === workPmEndHour && minute < workPmEndMinute)
    ) {
      openAlarmWindow();
    }
  }
}

// 检查午休提醒
function checkLunchBreakTime(hour, minute) {
  const workAmEndHour = Number(timeSettings["workAmEndHour"]);
  const workAmEndMinute = Number(timeSettings["workAmEndMinute"]);

  if (hour === workAmEndHour && minute === workAmEndMinute) {
    openLunchBreakWindow();
  }
}

// 检查打卡
function checkClockTime(hour, minute) {
  const clockStartHour = Number(timeSettings["clockStartHour"]);
  const clockStartMinute = Number(timeSettings["clockStartMinute"]);
  const clockEndHour = Number(timeSettings["clockEndHour"]);
  const clockEndMinute = Number(timeSettings["clockEndMinute"]);

  if (hour === clockStartHour && minute === clockStartMinute) {
    openClockWindow("start");
  }

  if (hour === clockEndHour && minute === clockEndMinute) {
    openClockWindow("end");
  }
}

// 打开休息窗口
function openRestWindow() {
  openFullWindow(
    "./../sections/win/midday-rest.html",
    "https://www.toutiao.com/",
    {
      closeTime: timeSettings["workRestMinute"],
    },
    {
      closeTime: 5,
    }
  );
}

// 打开休息提醒框
function openAlarmWindow() {
  openFullWindow(
    "./../sections/win/midday-rest.html",
    "https://www.toutiao.com/",
    {
      closeTime: timeSettings["workRestMinute"],
    },
    {
      closeTime: 5,
    }
  );
}

// 打开午休提醒框
function openLunchBreakWindow() {
  openFullWindow("./../sections/win/lunch-break.html");
}

// 打开打卡提醒框
function openClockWindow(flag) {
  openFullWindow(`./../sections/win/clock-${flag}.html`);
}

// 打开窗口
function openWindow(url, winInternalOpt = {}, winCustomOpt = {}) {
  var modalPath = url;
  if (url.search("http") === -1 && url.search("www") === -1) {
    modalPath = path.join("file://", __dirname, url);
  }
  let win = new BrowserWindow(
    Object.assign({}, winInternalOpt, { show: false })
  );
  win.on("close", function () {
    win = null;
  });

  win.loadURL(modalPath);
  win.once("ready-to-show", () => {
    win.show();
  });

  // 置顶窗口
  if (winCustomOpt.isTop) {
    win.setAlwaysOnTop(true);
  }

  // 定时关闭
  if (winCustomOpt.autoClose) {
    const closeTime = winCustomOpt.closeTime ? winCustomOpt.closeTime : 5;
    setTimeout(() => {
      if (win) win.close();
    }, closeTime * 60 * 1000);
  }

  return win;
}

// 打开全屏窗口
function openFullWindow(url, otherWinUrl, opt = {}, otherOpt = {}) {
  // 打开主屏幕弹窗
  openWindow(
    url,
    {
      frame: false,
      width: window.screen.width,
      height: window.screen.height,
    },
    Object.assign(
      {
        isTop: true,
        autoClose: true,
      },
      opt
    )
  );

  // 打开第二个屏幕弹窗
  const externalDisplay = hasTwoWin();
  if (!externalDisplay || !otherWinUrl) return;
  openWindow(
    otherWinUrl,
    {
      x: externalDisplay.bounds.x,
      y: externalDisplay.bounds.y,
      width: window.screen.width,
      height: window.screen.height,
      webPreferences: {
        nodeIntegration: true,
      },
    },
    Object.assign(
      {
        isTop: true,
        autoClose: true,
      },
      otherOpt
    )
  );
}

// 判断是否为双屏
function hasTwoWin() {
  // 检测是否为双屏
  let displays = screen.getAllDisplays();
  let externalDisplay = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0;
  });
  return externalDisplay;
}

const btnSave = document.getElementById("button-save");
if (btnSave)
  btnSave.addEventListener(
    "updateSettings",
    function (e) {
      timeSettings.updateSettings();
    },
    false
  );
