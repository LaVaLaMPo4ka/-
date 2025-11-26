import React, { useEffect, useState } from "react";

export default function Rules() {
  const [rules, setRules] = useState(
    () => localStorage.getItem("az_rules") || ""
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

        const text = json.data?.az_rules;
        if (typeof text === "string") {
          setRules(text);
          localStorage.setItem("az_rules", text);
        }
      } catch (e) {
        console.error("Ошибка загрузки правил:", e);
      }
    }

    function onStorage(e) {
      if (e.key === "az_rules") {
        setRules(e.newValue || "");
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
      <h2 className="text-2xl font-bold mb-3">Правила</h2>
      <div className="whitespace-pre-wrap text-gray-200">
        {rules || "Правила пока не заданы."}
      </div>
    </div>
  );
}
