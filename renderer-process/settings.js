const settings = require("electron-settings");
const ipc = require("electron").ipcRenderer;

// 保存
var event = new Event("setWorkElementText");
var updateSettingsEvent = new Event("updateSettings");
const btnSave = document.getElementById("button-save");
btnSave.addEventListener("click", function () {
  saveWorkTimeSettings();
  settings.set("deSave", true); // 已配置
  btnSave.dispatchEvent(event);
  btnSave.dispatchEvent(updateSettingsEvent);
});

// 取消
const btnRest = document.getElementById("button-rest");
btnSave.addEventListener("click", function () {
  setWorkElementInputText();
});

// 后台运行
const CheckTray = document.getElementById("input-bg-process-check");
CheckTray.addEventListener("change", function () {
  if (!this.checked) {
    trayOn = false;
    ipc.send("remove-tray");
  } else {
    trayOn = true;
    ipc.send("put-in-tray");
  }
});
(function () {
  const workTimeSettingMap = settings.get("workTimeSettingMap");
  if (!workTimeSettingMap) return;

  const value = workTimeSettingMap["bgProcessCheck"];
  let timeValue =
    settings.get("bgProcessCheck") !== undefined
      ? settings.get("bgProcessCheck")
      : value.default;

  if (timeValue) {
    ipc.send("put-in-tray");
  }
})();

// 格式化时间
function getTimeStr(val = 0) {
  return val.toString().padStart(2, "0");
}

// 转换驼峰字符串
function hyphenate(str) {
  var hyphenateRE = /\B([A-Z])/g;
  return str.replace(hyphenateRE, "-$1").toLowerCase();
}

// 获取时间配置的参数显示到首页
function setWorkElementInputText() {
  const workTimeSettingMap = settings.get("workTimeSettingMap");
  if (!workTimeSettingMap) return;

  for (const key in workTimeSettingMap) {
    if (!Object.hasOwnProperty.call(workTimeSettingMap, key)) return;
    const name = key;
    const value = workTimeSettingMap[key];

    let timeValue =
      settings.get(name) !== undefined ? settings.get(name) : value.default;
    if (Array.isArray(timeValue)) timeValue = timeValue.join("、");

    const element = document.getElementById(`input-${hyphenate(name)}`);
    if (element)
      name.indexOf("Check") > -1
        ? (element.checked = timeValue)
        : (element.value = timeValue);
  }
}

// 保存配置
function saveWorkTimeSettings() {
  const workTimeSettingMap = settings.get("workTimeSettingMap");
  if (!workTimeSettingMap) return;

  for (const key in workTimeSettingMap) {
    if (!Object.hasOwnProperty.call(workTimeSettingMap, key)) return;

    const name = key;
    const element = document.getElementById(`input-${hyphenate(name)}`);
    let elementValue =
      name.indexOf("Check") > -1 ? element.checked : element.value;
    if (elementValue.length && elementValue.indexOf("、") > -1)
      elementValue = elementValue.split("、");

    settings.set(name, elementValue);
  }
}

setWorkElementInputText();
const openSettings = document.querySelector(".open-settings");
Array.prototype.forEach.call(openSettings, (element) => {
  element.addEventListener("click", function () {
    setWorkElementInputText();
  });
});
