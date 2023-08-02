import express from "express";
import { neru } from "neru-alpha";
import { handleAuth } from "../handleAuth";
import { DB_TABLENAME_WHITELIST } from "../handleFilters";

const filterRouter = express.Router();

if (ENABLE_WHITELIST_CHECK) {
  filterRouter.post("/whitelist", handleAuth, async (req, res) => {
    try {
      const { number } = req.body;

      if (!number) throw new Error("No number provided.");

      const db = neru.getInstanceState();
      const newWhitelistEntry = await db.rpush(DB_TABLENAME_WHITELIST);
      return res.json({ success: true, data: newWhitelistEntry });
    } catch (e) {
      console.error("Whitelist addition error: ", e);
      return res.json({ success: false, error: e });
    }
  });

  filterRouter.delete("/whitelist", handleAuth, async (req, res) => {
    try {
      const { number } = req.body;

      if (!number) throw new Error("No number provided.");

      const db = neru.getInstanceState();
      const deletedWhitelistEntry = await db.hdel(DB_TABLENAME_WHITELIST, [
        number,
      ]);
      return res.json({ success: true, data: deletedWhitelistEntry });
    } catch (e) {
      console.error("Whitelist deletion error: ", e);
      return res.json({ success: false, error: e });
    }
  });
}

export default filterRouter;
