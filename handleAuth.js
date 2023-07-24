import { handleErrorResponse } from "./handleErrors.js"
import axios from "axios"

export async function handleAuth(req, res, next) {
    try {
        const response = await axios.get(`https://rest.nexmo.com/account/get-balance`, { headers: { Authorization: `${req.headers["authorization"]}` } })
        if (response?.data?.value > 0) { next() } else throw new Error("Invalid api key and secret")

    } catch (e) {
        console.log("axios response: ", e?.response?.data)
        return handleErrorResponse(e, res, "Auth error.")
    }
}
