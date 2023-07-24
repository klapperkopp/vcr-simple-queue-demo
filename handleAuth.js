import { handleErrorResponse } from "./handleErrors.js"
import axios from "axios"

export async function handleAuth(req, res, next) {
    try {
        const API_APPLICATION_ID = process.env.API_APPLICATION_ID
        console.log(API_APPLICATION_ID)
        const response = await axios.get(`https://api.nexmo.com/v2/applications/${API_APPLICATION_ID}`, { headers: { Authorization: `${req.headers["authorization"]}` } })
        if (API_APPLICATION_ID && response?.data?.id === API_APPLICATION_ID) { next() } else throw new Error("Invalid api key and secret")

    } catch (e) {
        console.log("axios response: ", e?.response?.data)
        return handleErrorResponse(e, res, "Auth error.")
    }
}
