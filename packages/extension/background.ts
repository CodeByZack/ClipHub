// background.ts

const toast = async (msg: string) => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tabs.length) return;
  const tab = tabs[0];
  chrome.scripting.executeScript({
    target: { tabId: tab.id! },
    world: "MAIN",
    func: (msg: string) => {
      globalThis.chToast(msg);
    },
    args: [msg],
  });
};

const sendMediaUrl = async (url: string, type: "video" | "audio") => {
  // 读取 baseUrl
  const { baseUrl } = await chrome.storage.local.get("baseUrl");
  const { password } = await chrome.storage.local.get("password");

  if (!baseUrl) {
    toast("未设置 baseUrl");
    return;
  }

  if (!password) {
    toast("未设置 password");
    return;
  }

  try {
    const res = await fetch(`${baseUrl}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${password}`,
      },
      body: JSON.stringify({ url, type }),
    });

    if (res.status === 401) {
      toast("认证失败" + res.statusText || "请检查密码");
      return;
    }

    toast("任务已提交");
    console.log("上传成功:", await res.json());
  } catch (err) {
    toast("任务提交失败" + (err instanceof Error ? err.message : err));
    console.error("上传失败:", err);
  }
};

chrome.runtime.onInstalled.addListener(() => {
  // 注册一个右键菜单
  chrome.contextMenus.create({
    id: "download-video",
    title: "download video",
    contexts: ["all"],
  });
  chrome.contextMenus.create({
    id: "download-audio",
    title: "download audio",
    contexts: ["all"],
  });
});

// 监听右键菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "download-audio") {
    const pageUrl = tab?.url;
    console.log("pageUrl", pageUrl);
    if (!pageUrl) return;
    sendMediaUrl(pageUrl, "audio");
  }
  if (info.menuItemId === "download-video") {
    const pageUrl = tab?.url;
    console.log("pageUrl", pageUrl);
    if (!pageUrl) return;
    sendMediaUrl(pageUrl, "video");
  }
});

//监听popup发送过来的事件
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "download-media") {
    const { url, type } = message;
    if (!url || !type) return;
    sendMediaUrl(url, type);
  }
});
