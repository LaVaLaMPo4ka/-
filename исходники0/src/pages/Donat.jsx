import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function truncate(text, n = 120) {
  if (!text) return "";
  return text.length > n ? text.slice(0, n).trim() + "..." : text;
}

export default function Donat() {
  const [donats, setDonats] = useState(() => {
    try {
      const d = localStorage.getItem("az_donats");
      return d ? JSON.parse(d) : [];
    } catch {
      return [];
    }
  });

  // выбранный донат для модалки
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function loadFromServer() {
      try {
        const res = await fetch("/data_fetch.php", {
          method: "GET",
          credentials: "include",
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json || json.status !== "ok") return;

        const arr = json.data?.az_donats;
        if (Array.isArray(arr)) {
          setDonats(arr);
          localStorage.setItem("az_donats", JSON.stringify(arr));
        }
      } catch (e) {
        console.error("Ошибка загрузки донатов:", e);
      }
    }

    function onStorage(e) {
      if (e.key === "az_donats") {
        try {
          setDonats(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {
          setDonats([]);
        }
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
    <>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Донат</h2>
        <p className="opacity-70 text-sm">
          Поддержи развитие Azatara и получи красивые плюшки ✨
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {donats.map((d, idx) => (
            <motion.button
              key={d.id || idx}
              type="button"
              layout
              className="
                glass rounded-2xl p-4 flex flex-col gap-3 text-left cursor-pointer
                transition-all duration-300 ease-[cubic-bezier(0.4,0.0,0.2,1)]
                shadow-lg border border-white/10
                hover:-translate-y-1
                hover:shadow-[0_0_35px_8px_rgba(56,189,248,0.45)]
                hover:border-cyan-300/60
              "
              onClick={() => setSelected(d)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Окошко под картинку 16:9, картинка полностью влезает */}
              <div className="w-full rounded-xl overflow-hidden bg-black/40 border border-white/5">
                <div className="relative w-full aspect-[16/9] flex items-center justify-center">
                  {d.img && (
                    <img
                      src={d.img}
                      alt=""
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </div>
              </div>

              <div className="font-semibold text-lg flex items-center gap-2">
                {d.emoji && <span>{d.emoji}</span>}
                <span>{d.title}</span>
              </div>

              {d.desc && (
                <div className="text-sm opacity-80">
                  {truncate(d.desc, 140)}
                </div>
              )}

              <div className="text-xs opacity-60 mt-auto">
                Нажми, чтобы увидеть подробнее
              </div>
            </motion.button>
          ))}

          {donats.length === 0 && (
            <div className="text-sm opacity-60">
              Список донат-пакетов пока пуст. Настрой его в админке.
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно с донатом */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="glass rounded-3xl border border-white/10 shadow-2xl max-w-xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* заголовок + кнопка закрытия */}
              <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-white/5">
                <div className="font-semibold text-lg">
                  {selected.title || "Донат-пакет"}
                </div>
                <button
                  type="button"
                  className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  onClick={() => setSelected(null)}
                >
                  Закрыть
                </button>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto">
                {/* большое окно под картинку */}
                {selected.img && (
                  <div className="w-full rounded-2xl overflow-hidden bg-black/40 border border-white/5">
                    <div className="relative w-full aspect-[16/9] flex items-center justify-center">
                      <img
                        src={selected.img}
                        alt=""
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {selected.desc && (
                  <div className="text-sm opacity-90 whitespace-pre-wrap leading-relaxed">
                    {selected.desc}
                  </div>
                )}

                {selected.extra && (
                  <div className="text-xs opacity-70">
                    {selected.extra}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
