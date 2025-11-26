import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Features() {
  const [features, setFeatures] = useState(() => {
    try {
      const f = localStorage.getItem("az_features");
      return f ? JSON.parse(f) : [];
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

        const arr = json.data?.az_features;
        if (Array.isArray(arr)) {
          setFeatures(arr);
          localStorage.setItem("az_features", JSON.stringify(arr));
        }
      } catch (e) {
        console.error("Ошибка загрузки возможностей:", e);
      }
    }

    function onStorage(e) {
      if (e.key === "az_features") {
        try {
          setFeatures(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {
          setFeatures([]);
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
        <h2 className="text-2xl font-bold">Возможности</h2>
        <p className="opacity-70 text-sm">
          Всё то, что делает Azatara особенным ✨
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((f, idx) => (
            <motion.button
              key={f.id || idx}
              type="button"
              className="
                glass rounded-2xl p-4 text-left cursor-pointer
                transition-all duration-300 ease-[cubic-bezier(0.4,0.0,0.2,1)]
                shadow-lg border border-white/10
                hover:-translate-y-1
                hover:shadow-[0_0_35px_8px_rgba(56,189,248,0.45)]
                hover:border-cyan-300/60
              "
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelected(f)}
            >
              <div className="font-semibold text-lg">{f.title}</div>
              {f.desc && (
                <p className="text-sm opacity-80 mt-2 line-clamp-3">
                  {f.desc}
                </p>
              )}
            </motion.button>
          ))}

          {features.length === 0 && (
            <div className="text-sm opacity-60">
              Возможности пока не настроены.
            </div>
          )}
        </div>
      </div>

      {/* МОДАЛКА */}
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
