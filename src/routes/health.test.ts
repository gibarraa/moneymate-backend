import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AddressInfo } from "node:net";
import { app } from "../app.js";

describe("health endpoint", () => {
  it("reporta que la API esta activa", async () => {
    const server = await new Promise<ReturnType<typeof app.listen>>((resolve) => {
      const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
    });

    try {
      const { port } = server.address() as AddressInfo;
      const response = await fetch(`http://127.0.0.1:${port}/api/health`);

      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), {
        status: "ok",
        message: "Moneymate API running",
      });
    } finally {
      server.close();
    }
  });
});
