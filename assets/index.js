const settings = require("electron-settings");

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
function setWorkElementText() {
  const workTimeSettingMap = settings.get("workTimeSettingMap");
  if (!workTimeSettingMap) return;

  for (const key in workTimeSettingMap) {
    if (!Object.hasOwnProperty.call(workTimeSettingMap, key)) return;
    const name = key;
    const value = workTimeSettingMap[key];

    let timeValue =
      settings.get(name) !== undefined ? settings.get(name) : value.default;
    if (Array.isArray(timeValue)) timeValue = timeValue.join("、");

    const element = document.getElementById(hyphenate(name));
    if (element) element.innerText = timeValue;
  }
}

setWorkElementText();
const btnSave = document.getElementById("button-save");
if (btnSave)
  btnSave.addEventListener(
    "setWorkElementText",
    function (e) {
      setWorkElementText();
    },
    false
  );
