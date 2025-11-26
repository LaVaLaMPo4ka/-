import React, { useEffect, useState } from "react";
import NewsList from "../components/NewsList";
import Slider from "../components/Slider";
import { motion } from "framer-motion";

export default function Home() {
  const [uniqueFeatures, setUniqueFeatures] = useState(() => {
    try {
      const f = localStorage.getItem("az_unique_features");
      return f ? JSON.parse(f) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    async function loadFromServer() {
      try {
        const res = await fetch("/data_fetch.php", {
          method: "GET",
          credentials: "include",
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json || json.status !== "ok") return;

        const d = json.data || {};
        if (Array.isArray(d.az_unique_features)) {
          setUniqueFeatures(d.az_unique_features);
          localStorage.setItem(
            "az_unique_features",
            JSON.stringify(d.az_unique_features)
          );
        }
      } catch (e) {
        console.error("Ошибка загрузки данных для главной:", e);
      }
    }

    function onLocal() {
      try {
        const f = localStorage.getItem("az_unique_features");
        setUniqueFeatures(f ? JSON.parse(f) : []);
      } catch {
        setUniqueFeatures([]);
      }
    }

    loadFromServer();
    window.addEventListener("localstorage:changed", onLocal);
    window.addEventListener("storage", onLocal);

    return () => {
      window.removeEventListener("localstorage:changed", onLocal);
      window.removeEventListener("storage", onLocal);
    };
  }, []);

  return (
    <div className="space-y-10">
      <section className="text-center space-y-4">
        <motion.h1
          className="text-3xl md:text-4xl font-extrabold"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Добро пожаловать на{" "}
          <span className="text-az-primary drop-shadow-[0_0_18px_rgba(56,189,248,0.9)]">
            Azatara
          </span>
        </motion.h1>
        <motion.p
          className="opacity-80 max-w-3xl mx-auto text-sm md:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <span className="block">
            Атмосферный Minecraft-сервер с кастомными механиками, лором и с
            интересным геймплеем.
          </span>
          <span className="block">
            Наш сервер — свободный, на нём нет душных правил или ограничений.
          </span>
        </motion.p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold">Уникальные фичи</h3>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Slider
            items={uniqueFeatures.map((f) => ({
              title: f.title,
              text: f.desc,
              img: f.img,
            }))}
          />
        </motion.div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xl font-bold">Блог / Новости</h3>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <NewsList />
        </motion.div>
      </section>
    </div>
  );
}
