import express from "express";
import { neru } from "neru-alpha";
import { handleAuth } from "../handleAuth.js";
import { DB_TABLENAME_WHITELIST } from "../handleFilters.js";

const ENABLE_WHITELIST_CHECK = process.env.ENABLE_WHITELIST_CHECK;
/*
const ENABLE_CONTENT_FILTER = process.env.ENABLE_CONTENT_FILTER;
const ENABLE_GSM_CHECK = process.env.ENABLE_GSM_CHECK;
const ENABLE_LENGTH_CHECK = process.env.ENABLE_LENGTH_CHECK;
*/

const filterRouter = express.Router();

if (ENABLE_WHITELIST_CHECK) {
  filterRouter.post("/whitelist", handleAuth, async (req, res) => {
    try {
      const { number } = req.body;

      if (!number) throw new Error("No number provided.");

      const db = neru.getInstanceState();
      const newWhitelistEntry = await db.rpush(DB_TABLENAME_WHITELIST);
      console.log("Added new whitelist entry with status: ", newWhitelistEntry);
      return res.json({ success: true });
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
