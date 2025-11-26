import React, { useEffect, useState } from "react";

export default function NewsList() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    async function loadFromServer() {
      try {
        const res = await fetch("/data_fetch.php", {
          method: "GET",
          credentials: "include",
        });
        const json = await res.json().catch(() => null);

        if (!res.ok || !json || json.status !== "ok") {
          const raw = localStorage.getItem("az_news");
          setNews(raw ? JSON.parse(raw) : []);
          return;
        }

        const serverNews = json.data?.az_news || [];
        setNews(serverNews);
        localStorage.setItem("az_news", JSON.stringify(serverNews));
      } catch (e) {
        console.error("Ошибка загрузки новостей:", e);
        const raw = localStorage.getItem("az_news");
        setNews(raw ? JSON.parse(raw) : []);
      }
    }

    function onLocalChange() {
      try {
        const raw = localStorage.getItem("az_news");
        setNews(raw ? JSON.parse(raw) : []);
      } catch {
        setNews([]);
      }
    }

    loadFromServer();
    window.addEventListener("localstorage:changed", onLocalChange);
    window.addEventListener("storage", onLocalChange);

    return () => {
      window.removeEventListener("localstorage:changed", onLocalChange);
      window.removeEventListener("storage", onLocalChange);
    };
  }, []);

  if (!news || news.length === 0) {
    return (
      <div className="text-sm opacity-60">
        Новостей пока нет. Скоро здесь появятся свежие новости Azatara ✨
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {news.map((n) => (
        <div
          key={n.id}
          className="glass p-4 rounded-xl border border-white/5 shadow-lg"
        >
          <div className="flex justify-between items-center gap-4 mb-2">
            <h3 className="font-semibold text-lg">
              {n.title || "Без названия"}
            </h3>
          </div>

          {n.content && (
            <p className="text-sm opacity-80 whitespace-pre-wrap mb-2">
              {n.content}
            </p>
          )}

          {n.media && (
            <img
              src={n.media}
              alt=""
              className="max-h-60 object-contain rounded mt-2"
            />
          )}

          <div className="text-xs opacity-60 mt-2">
            {n.date ? new Date(n.date).toLocaleString() : ""}
          </div>
        </div>
      ))}
    </div>
  );
}
