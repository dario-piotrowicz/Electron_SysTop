const path = require("path");
const osu = require("node-os-utils");

const os = osu.os;
const cpu = osu.cpu;
const mem = osu.mem;

const setInnerTextById = (elementId, text) =>
  (document.getElementById(elementId).innerText = text);

const setInnerText = (element, text) => (element.innerText = text);

(async function setStaticInfo() {
  setInnerTextById("cpu-model", cpu.model());
  setInnerTextById("computer-name", os.hostname());
  setInnerTextById("os", `${os.type()} ${os.arch()}`);
  const memInfo = await mem.info();
  const totalMemGB = (memInfo.totalMemMb / 1024).toFixed(2);
  setInnerTextById("system-memory", `${totalMemGB} GB`);
})();

const monitoringInternalInMillis = 1000;
const cpuOverloadThreshold = 80;
const cpuUsageEl = document.getElementById("cpu-usage");
const cpuProgressBarEl = document.getElementById("cpu-progress");
const cpuFreeEl = document.getElementById("cpu-free");
const uptimeEl = document.getElementById("system-uptime");

updateDynamicInfo = async () => {
  const cpuUsage = await cpu.usage();
  setInnerText(cpuUsageEl, `${cpuUsage.toFixed(2)}%`);
  cpuProgressBarEl.style.width = `${cpuUsage}%`;
  cpuProgressBarEl.style.backgroundColor = `var(--${
    cpuUsage < cpuOverloadThreshold ? "primary" : "danger"
  }-color)`;
  const cpuFree = await cpu.free();
  setInnerText(cpuFreeEl, `${cpuFree.toFixed(2)}%`);
  setInnerText(uptimeEl, convertSecondsToReadableFormat(os.uptime()));
  if (cpuUsage >= cpuOverloadThreshold) {
    notifyUserCpuOverload(cpuUsage, cpuOverloadThreshold);
  }
};

setInterval(updateDynamicInfo, monitoringInternalInMillis);

const secondsInAMinute = 60;
const secondsInAnHour = 60 * 60;
const secondsInADay = secondsInAnHour * 24;
const convertSecondsToReadableFormat = (totalSeconds) => {
  const days = Math.floor(totalSeconds / secondsInADay);
  const hours = Math.floor((totalSeconds % secondsInADay) / secondsInAnHour);
  const minutes = Math.floor(
    (totalSeconds % secondsInAnHour) / secondsInAMinute
  );
  const seconds = Math.floor(totalSeconds % secondsInAMinute);
  return `${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
};

const alertFrequencyInMinutes = 5;
const alertFrequencyInMillis =
  alertFrequencyInMinutes * (1000 * secondsInAMinute);
let lastNotificationTimeInMillis =
  +localStorage.getItem("lastNotificationTimeInMillis") || -1;
const notifyUserCpuOverload = (cpuUsage, cpuOverloadThreshold) => {
  const nowInMillis = new Date().getTime();
  if (nowInMillis > lastNotificationTimeInMillis + alertFrequencyInMillis) {
    new Notification("CPU Overload", {
      body: `The CPU usage is ${cpuUsage}%, above the threshold of ${cpuOverloadThreshold}%`,
      icon: `${path.join(__dirname, "..", "assets", "icons", "icon.png")}`,
    });
    lastNotificationTimeInMillis = nowInMillis;
    localStorage.setItem(
      "lastNotificationTimeInMillis",
      lastNotificationTimeInMillis
    );
  }
};
