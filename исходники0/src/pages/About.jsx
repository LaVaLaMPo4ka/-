import React, { useEffect, useState } from "react";

export default function About() {
  const [about, setAbout] = useState(
    () => localStorage.getItem("az_about") || ""
  );

  useEffect(() => {
    async function loadFromServer() {
      try {
        const res = await fetch("/data_fetch.php", {
          method: "GET",
          credentials: "include",
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json || json.status !== "ok") return;

        const text = json.data?.az_about;
        if (typeof text === "string") {
          setAbout(text);
          localStorage.setItem("az_about", text);
        }
      } catch (e) {
        console.error("Ошибка загрузки описания:", e);
      }
    }

    function onStorage(e) {
      if (e.key === "az_about") {
        setAbout(e.newValue || "");
      }
    }

    loadFromServer();
    window.addEventListener("storage", onStorage);
    window.addEventListener("localstorage:changed", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("localstorage:changed", onStorage);
    };
  }, []);

  return (
    <div className="glass p-6 rounded-2xl">
      <h2 className="text-2xl font-bold mb-3">О сервере</h2>
      <div className="whitespace-pre-wrap text-gray-200">
        {about || "Описание пока не задано."}
      </div>
    </div>
  );
}
