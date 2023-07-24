import express from "express";
import { neru, Queue, Messages } from "neru-alpha";
import { handleErrorResponse } from "./handleErrors.js";
import { handleAuth } from "./handleAuth.js";

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
app.post("/queues/create", handleAuth, async (req, res) => {
  const { name, maxInflight, msgPerSecond } = req.body;

  // check if queue name was provided
  if (!name) return res.status(500).send("No name found.");

  try {
    const session = neru.createSession();
    const queueApi = new Queue(session);

    // create a new queue item with neru queue provider
    await queueApi
      .createQueue(name, `/queues/${name}`, {
        maxInflight: maxInflight || DEFAULT_MAX_INFLIGHT,
        msgPerSecond: msgPerSecond || DEFAULT_MPS,
        active: true,
      })
      .execute();

    // send http response
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
app.post("/queues/additem/:name", handleAuth, async (req, res) => {
  const { name } = req.params;

  // check if queue name was provided
  if (!name) return res.status(500).send("No name found.");

  try {
    const session = neru.createSession();
    const queueApi = new Queue(session);

    // create a new queue item with neru queue provider
    await queueApi
      .enqueueSingle(name, {
        originalBody: req.body,
        internalApiSecret: INTERNAL_API_SECRET,
      })
      .execute();

    // send http response
    return res.status(200).json({ success: true });
  } catch (e) {
    return handleErrorResponse(e, res, "Adding queue item.");
  }
});

// api to delete a queue
app.delete("/queues/:name", handleAuth, async (req, res) => {
  const { name } = req.params;

  // check if queue name was provided
  if (!name) return res.sendStatus(500);

  try {
    const session = neru.createSession();
    const queueApi = new Queue(session);

    // delete queue
    await queueApi.deleteQueue(name).execute();

    // send http response
    return res.status(200).json({ success: true });
  } catch (e) {
    return handleErrorResponse(e, res, "Nothing to delete.");
  }
});

// this will be internally called when a queue item is executed
app.post("/queues/:name", async (req, res) => {
  const { name } = req.query;

  const { originalBody, internalApiSecret } = req.body;
  const { from } = originalBody;

  console.log("Webhook called by Queue with Name: ", name);

  // internal authentication, so no one can call the internal endpoint from outside world
  if (internalApiSecret !== INTERNAL_API_SECRET)
    return res.status(401).json({ success: false, error: "Unauthorized." });

  // replace sender with default sender ID if non provided
  if (!from) from = `${DEFAULT_SENDER_ID}`

  try {
    const session = neru.createSession();
    const messaging = new Messages(session);

    // send original message through neru messages provider
    await messaging.send(originalBody).execute();

    // return response iternally
    return res.sendStatus(200)
  } catch (e) {
    return handleErrorResponse(e, res, "Executing Queue Item");
  }
});

app.listen(PORT, () => {
  console.log(
    `Listening on ${process.env.NERU_APP_URL || "http://localhost:" + PORT} ...`
  );
});
