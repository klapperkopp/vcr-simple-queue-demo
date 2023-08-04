export function handleErrorResponse(e, res, errorHint, status = 500) {
  let message = `Error occured${
    errorHint ? " (" + errorHint + ")" : ""
  }. (${e}) / Details: ${e?.response?.data?.error}`;
  console.error(message);
  return res.status(500).json({ success: false, error: message });
}
