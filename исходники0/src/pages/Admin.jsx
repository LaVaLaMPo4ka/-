import React, { useState, useEffect } from "react";

const PASSWORD = "azadmin123";

// отправка данных на сервер (save.php)
async function syncToServer(key, value) {
  try {
    let data;
    if (key === "az_rules" || key === "az_about") {
      data = value || "";
    } else {
      data = value ? JSON.parse(value) : [];
    }

    const res = await fetch("/save.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, data }),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || !json || json.status !== "ok") {
      throw new Error(json?.message || "server_error");
    }
  } catch (e) {
    console.error("Ошибка сохранения на сервер:", e);
    alert(
      "Не удалось сохранить изменения на сервер. Возможно, сессия истекла — перезайдите в админку."
    );
  }
}

// запись + событие + фоновая синхронизация
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    // не ждём, чтобы UI не лагал
    syncToServer(key, value);

    try {
      window.dispatchEvent(new Event("localstorage:changed"));
    } catch (e) {}
    return true;
  } catch (e) {
    alert("Ошибка сохранения: " + e.message);
    return false;
  }
}

// помощник для dataURL
function fileToDataUrl(file, cb) {
  const reader = new FileReader();
  reader.onload = () => cb(reader.result);
  reader.onerror = () => cb(null);
  reader.readAsDataURL(file);
}

export default function Admin() {
  const [logged, setLogged] = useState(false);
  const [pw, setPw] = useState("");
  const [tab, setTab] = useState("news");

  // основные данные
  const [rules, setRules] = useState(localStorage.getItem("az_rules") || "");
  const [about, setAbout] = useState(localStorage.getItem("az_about") || "");

  const [uniqueFeatures, setUniqueFeatures] = useState(() => {
    try {
      const f = localStorage.getItem("az_unique_features");
      return f ? JSON.parse(f) : [];
    } catch {
      return [];
    }
  });

  const [features, setFeatures] = useState(() => {
    try {
      const f = localStorage.getItem("az_features");
      return f ? JSON.parse(f) : [];
    } catch {
      return [];
    }
  });

  const [donats, setDonats] = useState(() => {
    try {
      const d = localStorage.getItem("az_donats");
      return d ? JSON.parse(d) : [];
    } catch {
      return [];
    }
  });

  const [crafts, setCrafts] = useState(() => {
    try {
      const c = localStorage.getItem("az_crafts");
      return c ? JSON.parse(c) : [];
    } catch {
      return [];
    }
  });

  const [news, setNews] = useState(() => {
    try {
      const n = localStorage.getItem("az_news");
      return n ? JSON.parse(n) : [];
    } catch {
      return [];
    }
  });

  // формы "нового" элемента
  const [newNews, setNewNews] = useState({ title: "", content: "", media: "" });
  const [newUnique, setNewUnique] = useState({ title: "", desc: "", img: "" });
  const [newFeature, setNewFeature] = useState({
    title: "",
    desc: "",
    img: "",
  });
  const [newDonat, setNewDonat] = useState({ title: "", desc: "", img: "" });
  const [newCraft, setNewCraft] = useState({ title: "", img: "" });

  // логин через auth.php (PHP-сессия)
  async function tryLogin(e) {
    e.preventDefault();
    if (!pw) {
      alert("Введите пароль");
      return;
    }

    try {
      const res = await fetch("/auth.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data || data.status !== "ok") {
        throw new Error(data?.message || "Ошибка авторизации");
      }

      setLogged(true);
      setPw("");
    } catch (err) {
      console.error(err);
      alert("Ошибка авторизации: " + err.message);
    }
  }

  // при открытии админки подтягиваем данные с сервера
  useEffect(() => {
    async function loadFromServer() {
      try {
        const res = await fetch("/data_fetch.php", {
          method: "GET",
          credentials: "include",
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json || json.status !== "ok") {
          return;
        }

        const d = json.data || {};

        if (typeof d.az_rules === "string") {
          setRules(d.az_rules);
          localStorage.setItem("az_rules", d.az_rules);
        }
        if (typeof d.az_about === "string") {
          setAbout(d.az_about);
          localStorage.setItem("az_about", d.az_about);
        }
        if (Array.isArray(d.az_unique_features)) {
          setUniqueFeatures(d.az_unique_features);
          localStorage.setItem(
            "az_unique_features",
            JSON.stringify(d.az_unique_features)
          );
        }
        if (Array.isArray(d.az_features)) {
          setFeatures(d.az_features);
          localStorage.setItem("az_features", JSON.stringify(d.az_features));
        }
        if (Array.isArray(d.az_donats)) {
          setDonats(d.az_donats);
          localStorage.setItem("az_donats", JSON.stringify(d.az_donats));
        }
        if (Array.isArray(d.az_crafts)) {
          setCrafts(d.az_crafts);
          localStorage.setItem("az_crafts", JSON.stringify(d.az_crafts));
        }
        if (Array.isArray(d.az_news)) {
          setNews(d.az_news);
          localStorage.setItem("az_news", JSON.stringify(d.az_news));
        }
      } catch (e) {
        console.error("Ошибка загрузки данных с сервера в админке:", e);
      }
    }

    loadFromServer();
  }, []);

  // универсальные операции
  function addItem(state, setState, key, newItem) {
    const item = {
      ...newItem,
      id: Date.now(),
      date: Date.now(),
    };
    const next = [item, ...state];
    setState(next);
    safeSetItem(key, JSON.stringify(next));
  }

  function deleteItem(state, setState, key, id) {
    const next = state.filter((i) => i.id !== id);
    setState(next);
    safeSetItem(key, JSON.stringify(next));
  }

  function updateItemField(state, setState, key, id, field, value) {
    const next = state.map((i) =>
      i.id === id
        ? {
            ...i,
            [field]: value,
          }
        : i
    );
    setState(next);
    safeSetItem(key, JSON.stringify(next));
  }

  // UI

  if (!logged) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Админ-панель Azatara</h1>
        <form
          onSubmit={tryLogin}
          className="glass p-6 rounded-2xl flex flex-col gap-3 w-full max-w-xs"
        >
          <label className="text-sm opacity-80">Пароль администратора</label>
          <input
            type="password"
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-cyan-400/70"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <button
            type="submit"
            className="mt-2 bg-cyan-500/80 hover:bg-cyan-400 text-black font-semibold rounded-xl py-2 text-sm transition-colors"
          >
            Войти
          </button>
          <p className="text-xs opacity-60 mt-2">
            После входа изменения будут сохраняться в общие файлы на сервере.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Админ-панель Azatara</h1>
        <div className="text-xs opacity-70">
          Изменения сохраняются в <code>localStorage</code> + серверные JSON
        </div>
      </div>

      {/* табы */}
      <div className="flex flex-wrap gap-2">
        {[
          ["news", "Новости"],
          ["unique", "Уникальные фичи"],
          ["features", "Возможности"],
          ["donats", "Донат"],
          ["crafts", "Крафты"],
          ["rules", "Правила"],
          ["about", "О сервере"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-3 py-1.5 rounded-xl text-sm border ${
              tab === id
                ? "bg-cyan-500/80 text-black border-cyan-300"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* контент вкладок */}
      {tab === "news" && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Новости</h2>
          {/* форма добавления */}
          <div className="glass p-4 rounded-2xl space-y-3">
            <div className="text-sm opacity-80">Добавить новость</div>
            <input
              type="text"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm"
              placeholder="Заголовок"
              value={newNews.title}
              onChange={(e) =>
                setNewNews((v) => ({ ...v, title: e.target.value }))
              }
            />
            <textarea
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm min-h-[80px]"
              placeholder="Текст новости"
              value={newNews.content}
              onChange={(e) =>
                setNewNews((v) => ({ ...v, content: e.target.value }))
              }
            />
            <div className="flex flex-col gap-2 text-sm">
              <label className="opacity-80">Картинка (опционально)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  fileToDataUrl(file, (url) => {
                    if (!url) return;
                    setNewNews((v) => ({ ...v, media: url }));
                  });
                }}
              />
            </div>
            <button
              className="bg-cyan-500/80 hover:bg-cyan-400 text-black font-semibold rounded-xl px-4 py-2 text-sm"
              onClick={() => {
                if (!newNews.title && !newNews.content) {
                  alert("Заполните хотя бы заголовок или текст");
                  return;
                }
                addItem(news, setNews, "az_news", newNews);
                setNewNews({ title: "", content: "", media: "" });
              }}
            >
              Сохранить новость
            </button>
          </div>

          {/* список новостей */}
          <div className="space-y-2">
            {news.map((n) => (
              <div
                key={n.id}
                className="glass p-4 rounded-2xl flex flex-col gap-2"
              >
                <div className="flex justify-between gap-2 items-center">
                  <input
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-sm"
                    value={n.title || ""}
                    placeholder="Заголовок"
                    onChange={(e) =>
                      updateItemField(
                        news,
                        setNews,
                        "az_news",
                        n.id,
                        "title",
                        e.target.value
                      )
                    }
                  />
                  <button
                    className="text-xs px-2 py-1 rounded-lg bg-red-500/80 text-white"
                    onClick={() =>
                      deleteItem(news, setNews, "az_news", n.id)
                    }
                  >
                    Удалить
                  </button>
                </div>
                <textarea
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm min-h-[60px]"
                  placeholder="Текст новости"
                  value={n.content || ""}
                  onChange={(e) =>
                    updateItemField(
                      news,
                      setNews,
                      "az_news",
                      n.id,
                      "content",
                      e.target.value
                    )
                  }
                />
                {n.media && (
                  <img
                    src={n.media}
                    alt=""
                    className="max-h-40 object-contain rounded-lg"
                  />
                )}
                <div className="text-xs opacity-60">
                  {n.date ? new Date(n.date).toLocaleString() : ""}
                </div>
              </div>
            ))}

            {news.length === 0 && (
              <div className="text-sm opacity-60">
                Новостей пока нет — добавь первую выше.
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "unique" && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Уникальные фичи</h2>

          <div className="glass p-4 rounded-2xl space-y-3">
            <input
              type="text"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm"
              placeholder="Название фичи"
              value={newUnique.title}
              onChange={(e) =>
                setNewUnique((v) => ({ ...v, title: e.target.value }))
              }
            />
            <textarea
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm min-h-[80px]"
              placeholder="Описание"
              value={newUnique.desc}
              onChange={(e) =>
                setNewUnique((v) => ({ ...v, desc: e.target.value }))
              }
            />
            <div className="flex flex-col gap-2 text-sm">
              <label className="opacity-80">Картинка</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  fileToDataUrl(file, (url) => {
                    if (!url) return;
                    setNewUnique((v) => ({ ...v, img: url }));
                  });
                }}
              />
            </div>
            <button
              className="bg-cyan-500/80 hover:bg-cyan-400 text-black font-semibold rounded-xl px-4 py-2 text-sm"
              onClick={() => {
                if (!newUnique.title && !newUnique.desc) {
                  alert("Заполните хотя бы название или описание");
                  return;
                }
                addItem(
                  uniqueFeatures,
                  setUniqueFeatures,
                  "az_unique_features",
                  newUnique
                );
                setNewUnique({ title: "", desc: "", img: "" });
              }}
            >
              Добавить фичу
            </button>
          </div>

          <div className="space-y-2">
            {uniqueFeatures.map((f) => (
              <div
                key={f.id}
                className="glass p-4 rounded-2xl flex flex-col gap-2"
              >
                <div className="flex justify-between gap-2 items-center">
                  <input
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-sm"
                    placeholder="Название"
                    value={f.title || ""}
                    onChange={(e) =>
                      updateItemField(
                        uniqueFeatures,
                        setUniqueFeatures,
                        "az_unique_features",
                        f.id,
                        "title",
                        e.target.value
                      )
                    }
                  />
                  <button
                    className="text-xs px-2 py-1 rounded-lg bg-red-500/80 text-white"
                    onClick={() =>
                      deleteItem(
                        uniqueFeatures,
                        setUniqueFeatures,
                        "az_unique_features",
                        f.id
                      )
                    }
                  >
                    Удалить
                  </button>
                </div>
                <textarea
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm min-h-[60px]"
                  placeholder="Описание"
                  value={f.desc || ""}
                  onChange={(e) =>
                    updateItemField(
                      uniqueFeatures,
                      setUniqueFeatures,
                      "az_unique_features",
                      f.id,
                      "desc",
                      e.target.value
                    )
                  }
                />
                {f.img && (
                  <img
                    src={f.img}
                    alt=""
                    className="max-h-40 object-contain rounded-lg"
                  />
                )}
              </div>
            ))}

            {uniqueFeatures.length === 0 && (
              <div className="text-sm opacity-60">
                Уникальные фичи ещё не добавлены.
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "features" && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Обычные возможности</h2>

          <div className="glass p-4 rounded-2xl space-y-3">
            <input
              type="text"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm"
              placeholder="Название"
              value={newFeature.title}
              onChange={(e) =>
                setNewFeature((v) => ({ ...v, title: e.target.value }))
              }
            />
            <textarea
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm min-h-[80px]"
              placeholder="Описание"
              value={newFeature.desc}
              onChange={(e) =>
                setNewFeature((v) => ({ ...v, desc: e.target.value }))
              }
            />
            <div className="flex flex-col gap-2 text-sm">
              <label className="opacity-80">Картинка</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  fileToDataUrl(file, (url) => {
                    if (!url) return;
                    setNewFeature((v) => ({ ...v, img: url }));
                  });
                }}
              />
            </div>
            <button
              className="bg-cyan-500/80 hover:bg-cyan-400 text-black font-semibold rounded-xl px-4 py-2 text-sm"
              onClick={() => {
                if (!newFeature.title && !newFeature.desc) {
                  alert("Заполните хотя бы название или описание");
                  return;
                }
                addItem(features, setFeatures, "az_features", newFeature);
                setNewFeature({ title: "", desc: "", img: "" });
              }}
            >
              Добавить возможность
            </button>
          </div>

          <div className="space-y-2">
            {features.map((f) => (
              <div
                key={f.id}
                className="glass p-4 rounded-2xl flex flex-col gap-2"
              >
                <div className="flex justify-between gap-2 items-center">
                  <input
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-sm"
                    placeholder="Название"
                    value={f.title || ""}
                    onChange={(e) =>
                      updateItemField(
                        features,
                        setFeatures,
                        "az_features",
                        f.id,
                        "title",
                        e.target.value
                      )
                    }
                  />
                  <button
                    className="text-xs px-2 py-1 rounded-lg bg-red-500/80 text-white"
                    onClick={() =>
                      deleteItem(features, setFeatures, "az_features", f.id)
                    }
                  >
                    Удалить
                  </button>
                </div>
                <textarea
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm min-h-[60px]"
                  placeholder="Описание"
                  value={f.desc || ""}
                  onChange={(e) =>
                    updateItemField(
                      features,
                      setFeatures,
                      "az_features",
                      f.id,
                      "desc",
                      e.target.value
                    )
                  }
                />
                {f.img && (
                  <img
                    src={f.img}
                    alt=""
                    className="max-h-40 object-contain rounded-lg"
                  />
                )}
              </div>
            ))}

            {features.length === 0 && (
              <div className="text-sm opacity-60">
                Возможности пока не настроены.
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "donats" && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Донат-пакеты</h2>

          <div className="glass p-4 rounded-2xl space-y-3">
            <input
              type="text"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm"
              placeholder="Название пакета"
              value={newDonat.title}
              onChange={(e) =>
                setNewDonat((v) => ({ ...v, title: e.target.value }))
              }
            />
            <textarea
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm min-h-[80px]"
              placeholder="Описание / привилегии"
              value={newDonat.desc}
              onChange={(e) =>
                setNewDonat((v) => ({ ...v, desc: e.target.value }))
              }
            />
            <div className="flex flex-col gap-2 text-sm">
              <label className="opacity-80">Картинка</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  fileToDataUrl(file, (url) => {
                    if (!url) return;
                    setNewDonat((v) => ({ ...v, img: url }));
                  });
                }}
              />
            </div>
            <button
              className="bg-cyan-500/80 hover:bg-cyan-400 text-black font-semibold rounded-xl px-4 py-2 text-sm"
              onClick={() => {
                if (!newDonat.title && !newDonat.desc) {
                  alert("Заполните хотя бы название или описание");
                  return;
                }
                addItem(donats, setDonats, "az_donats", newDonat);
                setNewDonat({ title: "", desc: "", img: "" });
              }}
            >
              Добавить донат
            </button>
          </div>

          <div className="space-y-2">
            {donats.map((d) => (
              <div
                key={d.id}
                className="glass p-4 rounded-2xl flex flex-col gap-2"
              >
                <div className="flex justify-between gap-2 items-center">
                  <input
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-sm"
                    placeholder="Название"
                    value={d.title || ""}
                    onChange={(e) =>
                      updateItemField(
                        donats,
                        setDonats,
                        "az_donats",
                        d.id,
                        "title",
                        e.target.value
                      )
                    }
                  />
                  <button
                    className="text-xs px-2 py-1 rounded-lg bg-red-500/80 text-white"
                    onClick={() =>
                      deleteItem(donats, setDonats, "az_donats", d.id)
                    }
                  >
                    Удалить
                  </button>
                </div>
                <textarea
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm min-h-[60px]"
                  placeholder="Описание"
                  value={d.desc || ""}
                  onChange={(e) =>
                    updateItemField(
                      donats,
                      setDonats,
                      "az_donats",
                      d.id,
                      "desc",
                      e.target.value
                    )
                  }
                />
                {d.img && (
                  <img
                    src={d.img}
                    alt=""
                    className="max-h-40 object-contain rounded-lg"
                  />
                )}
              </div>
            ))}

            {donats.length === 0 && (
              <div className="text-sm opacity-60">
                Донат-пакеты ещё не настроены.
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "crafts" && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Крафты</h2>

          <div className="glass p-4 rounded-2xl space-y-3">
            <input
              type="text"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm"
              placeholder="Название предмета / крафта"
              value={newCraft.title}
              onChange={(e) =>
                setNewCraft((v) => ({ ...v, title: e.target.value }))
              }
            />
            <div className="flex flex-col gap-2 text-sm">
              <label className="opacity-80">Картинка (схема крафта)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  fileToDataUrl(file, (url) => {
                    if (!url) return;
                    setNewCraft((v) => ({ ...v, img: url }));
                  });
                }}
              />
            </div>
            <button
              className="bg-cyan-500/80 hover:bg-cyan-400 text-black font-semibold rounded-xl px-4 py-2 text-sm"
              onClick={() => {
                if (!newCraft.title && !newCraft.img) {
                  alert("Нужно название или картинка");
                  return;
                }
                addItem(crafts, setCrafts, "az_crafts", newCraft);
                setNewCraft({ title: "", img: "" });
              }}
            >
              Добавить крафт
            </button>
          </div>

          <div className="space-y-2">
            {crafts.map((c) => (
              <div
                key={c.id}
                className="glass p-4 rounded-2xl flex flex-col gap-2"
              >
                <div className="flex justify-between gap-2 items-center">
                  <input
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-sm"
                    placeholder="Название"
                    value={c.title || ""}
                    onChange={(e) =>
                      updateItemField(
                        crafts,
                        setCrafts,
                        "az_crafts",
                        c.id,
                        "title",
                        e.target.value
                      )
                    }
                  />
                  <button
                    className="text-xs px-2 py-1 rounded-lg bg-red-500/80 text-white"
                    onClick={() =>
                      deleteItem(crafts, setCrafts, "az_crafts", c.id)
                    }
                  >
                    Удалить
                  </button>
                </div>
                {c.img && (
                  <img
                    src={c.img}
                    alt=""
                    className="max-h-40 object-contain rounded-lg"
                  />
                )}
              </div>
            ))}

            {crafts.length === 0 && (
              <div className="text-sm opacity-60">
                Крафты ещё не добавлены.
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "rules" && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Правила</h2>
          <div className="glass p-4 rounded-2xl space-y-3">
            <textarea
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm min-h-[240px]"
              placeholder="Правила сервера..."
              value={rules}
              onChange={(e) => setRules(e.target.value)}
            />
            <button
              className="bg-cyan-500/80 hover:bg-cyan-400 text-black font-semibold rounded-xl px-4 py-2 text-sm"
              onClick={() => safeSetItem("az_rules", rules || "")}
            >
              Сохранить правила
            </button>
          </div>
        </div>
      )}

      {tab === "about" && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">О сервере</h2>
          <div className="glass p-4 rounded-2xl space-y-3">
            <textarea
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm min-h-[240px]"
              placeholder="Описание сервера, лор, особенности..."
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />
            <button
              className="bg-cyan-500/80 hover:bg-cyan-400 text-black font-semibold rounded-xl px-4 py-2 text-sm"
              onClick={() => safeSetItem("az_about", about || "")}
            >
              Сохранить описание
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
