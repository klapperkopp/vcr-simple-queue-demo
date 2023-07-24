import express from "express";
import { neru, Queue, Messages } from "neru-alpha";
import { handleErrorResponse } from "./handleErrors.js";

const app = express();

const PORT = process.env.NERU_APP_PORT || 3000;

const DEFAULT_MPS = process.env.defaultMsgPerSecond || 30;
const DEFAULT_MAX_INFLIGHT = process.env.defaultMaxInflight || 30;
const DEFAULT_SENDER_ID = process.env.defaultSenderId || "Vonage";
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("App is running.");
});

// api to create a queue
app.post("/queues/create", async (req, res) => {
  const { name, maxInflight, msgPerSecond } = req.body;
  if (!name) return res.sendStatus(500);
  // create queue
  try {
    const session = neru.createSession();
    const queueApi = new Queue(session);
    const queue = await queueApi
      .createQueue(name, `/queues/${name}`, {
        maxInflight: maxInflight || DEFAULT_MAX_INFLIGHT,
        msgPerSecond: msgPerSecond || DEFAULT_MPS,
        active: true,
      })
      .execute();
    return res
      .status(201)
      .json({
        success: true,
        name,
        maxInflight: maxInflight || DEFAULT_MAX_INFLIGHT,
        msgPerSecond: msgPerSecond || DEFAULT_MPS,
      });
  } catch (e) {
    return handleErrorResponse(e, res, "Creating a new queue.");
  }
});

// api to add an item to a queue
// call this instead of messages api with the same payload but without required headers
app.post("/queues/additem/:name", async (req, res) => {
  const { name } = req.params;
  if (!name) return res.status(500).send("No name found.");
  try {
    const session = neru.createSession();
    const queueApi = new Queue(session);
    await queueApi
      .enqueueSingle(name, {
        ...req.body,
        internalApiSecret: INTERNAL_API_SECRET,
      })
      .execute();
    return res.status(200).json({ success: true });
  } catch (e) {
    return handleErrorResponse(e, res, "Adding queue item.");
  }
});

// api to delete a queue
app.delete("/queues/:name", async (req, res) => {
  const { name } = req.params;
  if (!name) return res.sendStatus(500);
  try {
    const session = neru.createSession();
    const queueApi = new Queue(session);
    await queueApi.deleteQueue(name).execute();
    return res.status(200).json({ success: true });
  } catch (e) {
    return handleErrorResponse(e, res, "Nothing to delete.");
  }
});

// this will be internally called when a queue item is executed
app.post("/queues/:name", async (req, res) => {
  const { name } = req.query;
  const { from, to, text, internalApiSecret } = req.body;

  console.log("Webhook called by Queue with Name: ", name);

  if (internalApiSecret !== INTERNAL_API_SECRET)
    return res.status(401).json({ success: false, error: "Unauthorized." });

  if (!from || (!from.type && !from.number))
    from = { type: "sms", number: `${DEFAULT_SENDER_ID}` };

  if (
    !from ||
    !to ||
    !text ||
    !from.type ||
    !from.number ||
    !to.type ||
    !to.number
  )
    return res.staus(500).json({
      success: false,
      error: "Missing sender or receiver information.",
    });

  try {
    const session = neru.createSession();
    const messaging = new Messages(session);

    await messaging.sendText(from, to, text).execute();
  } catch (e) {
    return handleErrorResponse(e, res, "Executing Queue Item");
  }
});

app.listen(PORT, () => {
  console.log(
    `Listening on ${process.env.NERU_APP_URL || "http://localhost:" + PORT} ...`
  );
});
