import { google } from 'googleapis'
import { ICredentials, IJson } from './model'
/**
 * Decode from process.env
 */
export function decodeFromEnv(key: string): IJson {
    const encoded = process.env[key]
    if (!encoded) {
        throw new Error(`Please define ${key} in .env`)
    }
    let result: IJson
    try {
        result = JSON.parse(Buffer.from(encoded, 'base64').toString())
    } catch (e) {
        throw new Error(`This value is not a JSON`)
    }
    return result
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
export function authorize(credentials: ICredentials, callback: () => void) {
    const { client_secret, client_id, redirect_uris } = credentials.installed
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0])

    // if (GOOGLE_ACCOUNT_TOKEN) {
    //     oAuth2Client.setCredentials(GOOGLE_ACCOUNT_TOKEN)
    //     callback(oAuth2Client)
    // } else {
    // getNewToken(oAuth2Client, callback)
    // }
}
