// server.js
import fetch from "node-fetch";
globalThis.fetch = fetch;

import("./index.js"); // now load your actual server
