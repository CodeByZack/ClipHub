import logo from "data-base64:~assets/icon.png";
import React, { useEffect, useState } from "react";
import "./style.css";

const saveConfig = (baseUrl: string, password: string) => {
  chrome.storage.local.set({ baseUrl, password }, () => {
    console.log("已保存 config:", { baseUrl, password });
  });
};

const getConfig = async () => {
  return new Promise<{ baseUrl?: string; password?: string }>((resolve) => {
    chrome.storage.local.get(["baseUrl", "password"], (items) => {
      resolve(items);
    });
  });
};

function IndexPopup() {
  const [baseUrl, setBaseUrl] = useState("");
  const [password, setPassWord] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getConfig().then((config) => {
      if (!config) return;
      setBaseUrl(config.baseUrl || "");
      setPassWord(config.password || "");
      if (config.baseUrl && config.password) {
        setCollapsed(true);
      }
    });
  }, []);

  const handleSave = () => {
    if (!baseUrl || !password) return;
    saveConfig(baseUrl, password);
    setSaved(true);
    setCollapsed(true);
    setTimeout(() => setSaved(false), 1400);
  };

  const downloadVideo = () => {
    // 获取当前tab的url 发送到 background 调用 sendMediaUrl 方法
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs.length) return;
      const tab = tabs[0];
      if (!tab.url) return;
      chrome.runtime.sendMessage({
        action: "download-media",
        url: tab.url,
        type: "video",
      });
    });
  };
  const downloadAudio = () => {
    // 获取当前tab的url 发送到 background 调用 sendMediaUrl 方法
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs.length) return;
      const tab = tabs[0];
      if (!tab.url) return;
      chrome.runtime.sendMessage({
        action: "download-media",
        url: tab.url,
        type: "audio",
      });
    });
  };

  const forceShowConfig = !baseUrl || !password;

  return (
    <div className="w-80 p-4 bg-white rounded-lg shadow-md font-sans text-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded flex items-center justify-center text-white font-bold">
            <img src={logo} alt="Logo" className="w-full h-full" />
          </div>
          <div>
            <div className="text-base font-medium">Clip Hub</div>
            <div className="text-xs text-gray-500">
              {collapsed ? "下载当前页面媒体" : "设置 API 与密码"}{" "}
            </div>
          </div>
        </div>
        {baseUrl && password && (
          <button
            onClick={() => setCollapsed((s) => !s)}
            className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 rounded"
            aria-label="toggle"
          >
            {collapsed ? "设置" : "关闭"}
          </button>
        )}
      </div>

      {(!collapsed || forceShowConfig) && (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600">API Base URL</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="请输入 baseUrl"
              className="mt-1 w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600">Password</label>
            <div className="mt-1 flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassWord(e.target.value)}
                placeholder="输入密码"
                className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
              <button
                onClick={() => setShowPassword((s) => !s)}
                className="ml-2 px-2 py-1 text-gray-600 hover:text-gray-800 rounded"
                aria-label="toggle-password"
                title={showPassword ? "隐藏密码" : "显示密码"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <button
              onClick={handleSave}
              disabled={!baseUrl || !password}
              className={`px-3 py-1 rounded text-white text-sm ${baseUrl && password ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300 cursor-not-allowed"}`}
            >
              保存
            </button>
            {saved && <div className="text-green-600 text-xs">已保存</div>}
          </div>
        </div>
      )}

      {collapsed && (
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={downloadVideo}
              className="flex-1 mt-2 px-3 py-1 bg-white border rounded text-sm hover:bg-gray-50"
            >
              下载 video
            </button>
            <button
              onClick={downloadAudio}
              className="flex-1 mt-2 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-600 rounded text-sm hover:bg-blue-100"
            >
              下载 audio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default IndexPopup;
