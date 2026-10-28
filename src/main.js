// src/main.js
// Entry point for the Hackathon edition of GuideMate
// Uses ES modules and a Web Worker for heavy checks

import { initUI } from "./ui.js";
import { initWorker } from "./worker-client.js";

async function bootstrap() {
  const worker = initWorker();
  const api = createApi(worker);
  await initUI(api);
}

function createApi(worker) {
  // Simple request‑response wrapper over the worker
  const pending = new Map();
  let msgId = 0;
  worker.onmessage = (e) => {
    const { id, payload, error } = e.data;
    const { resolve, reject } = pending.get(id) || {};
    if (resolve) {
      if (error) reject(new Error(error)); else resolve(payload);
      pending.delete(id);
    }
  };
  return {
    call(path, body) {
      return new Promise((resolve, reject) => {
        const id = ++msgId;
        pending.set(id, { resolve, reject });
        worker.postMessage({ id, path, body });
      });
    },
  };
}

bootstrap().catch((e) => console.error(e));
