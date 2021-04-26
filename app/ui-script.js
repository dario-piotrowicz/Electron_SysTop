const osu = require("node-os-utils");

const os = osu.os;
const cpu = osu.cpu;
const mem = osu.mem;

const setInnerTextById = (elementId, text) =>
  (document.getElementById(elementId).innerText = text);

(async function setStaticInfo() {
  setInnerTextById("cpu-model", cpu.model());
  setInnerTextById("computer-name", os.hostname());
  setInnerTextById("os", `${os.type()} ${os.arch()}`);
  const memInfo = await mem.info();
  const totalMemGB = (memInfo.totalMemMb / 1024).toFixed(2);
  setInnerTextById("system-memory", `${totalMemGB} GB`);
})();
