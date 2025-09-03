import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  world: "MAIN",
};

const createToast = (config = { duration: 3000, position: "top-center" }) => {
  const { duration, position } = config;
  const host = document.createElement("div");
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `<style>#toast-container{position:fixed;display:flex;flex-direction:column;gap:10px;z-index:9999}.toast{background:rgba(0,0,0,0.8);color:#fff;padding:10px 16px;border-radius:6px;font-size:14px;opacity:0;transform:translateY(20px);animation:fadeInOut 3s forwards}@keyframes fadeInOut{0%{opacity:0;transform:translateY(20px)}10%,90%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(20px)}}</style><div id="toast-container"></div>`;
  const container = shadow.querySelector("#toast-container") as HTMLDivElement;
  const updatePosition = (pos) => {
    const c = container;
    c.style.top = c.style.bottom = c.style.left = c.style.right = c.style.transform = "";
    if (pos.startsWith("top")) c.style.top = "20px";
    else c.style.bottom = "20px";
    if (pos.endsWith("left")) c.style.left = "20px";
    else if (pos.endsWith("right")) c.style.right = "20px";
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    else (c.style.left = "50%"), (c.style.transform = "translateX(-50%)"); // center
  };
  const showToast = (message) => {
    updatePosition(position);
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  };
  return showToast;
};

globalThis.chToast = createToast({
  duration: 3000, // 默认持续时间（毫秒）
  position: "top-center", // 默认位置: "top-left", "top-right", "bottom-left", "bottom-right"
});
