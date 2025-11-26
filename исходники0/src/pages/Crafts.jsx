import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Crafts() {
  const [crafts, setCrafts] = useState(() => {
    try {
      const c = localStorage.getItem("az_crafts");
      return c ? JSON.parse(c) : [];
    } catch {
      return [];
    }
  });

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

        const arr = json.data?.az_crafts;
        if (Array.isArray(arr)) {
          setCrafts(arr);
          localStorage.setItem("az_crafts", JSON.stringify(arr));
        }
      } catch (e) {
        console.error("Ошибка загрузки крафтов:", e);
      }
    }

    function onStorage(e) {
      if (e.key === "az_crafts") {
        try {
          setCrafts(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {
          setCrafts([]);
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
        <h2 className="text-2xl font-bold">Крафты</h2>
        <p className="opacity-70 text-sm">
          Уникальные и кастомные рецепты, созданные специально для Azatara ✨
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {crafts.map((c, idx) => (
            <motion.button
              key={c.id || idx}
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
              onClick={() => setSelected(c)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Картинка 16:9 */}
              <div className="w-full rounded-xl overflow-hidden bg-black/40 border border-white/5">
                <div className="relative w-full aspect-[16/9] flex items-center justify-center">
                  {c.img && (
                    <img
                      src={c.img}
                      alt=""
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </div>
              </div>

              <div className="font-semibold text-lg">{c.title}</div>

              {c.desc && (
                <div className="text-sm opacity-80 line-clamp-3">{c.desc}</div>
              )}

              <div className="text-xs opacity-60 mt-auto">
                Нажми, чтобы увидеть подробнее
              </div>
            </motion.button>
          ))}

          {crafts.length === 0 && (
            <div className="text-sm opacity-60">
              Пока нет добавленных крафтов — добавьте их в админке.
            </div>
          )}
        </div>
      </div>

      {/* Модалка крафта */}
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
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-white/5">
                <div className="font-semibold text-lg">
                  {selected.title}
                </div>
                <button
                  className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  onClick={() => setSelected(null)}
                >
                  Закрыть
                </button>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto">
                {/* Большая картинка */}
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
