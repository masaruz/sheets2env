import { green, red, yellow } from 'colors'
import { promises as fs } from 'fs'
import { Credentials, OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { createInterface } from 'readline'
import { SCOPE, TOKEN_PATH } from './constant'
import { IArg, ICredentials, IJson, ISheetRow } from './model'
/**
 * Read value from process env and decode it
 * @param key to specify value in process env
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
 */
export function authorize(creds: ICredentials, token: Credentials, callback: (oAuth2: OAuth2Client) => void): void {
    const {
        client_secret,
        client_id,
        redirect_uris } = creds.installed
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0])

    if (token) {
        oAuth2Client.setCredentials(token)
        callback(oAuth2Client)
    } else {
        getNewToken(oAuth2Client, callback)
    }
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
export function getNewToken(oAuth2: OAuth2Client, callback: (oAuth2: OAuth2Client) => void): void {
    const authUrl = oAuth2.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPE,
    })
    // tslint:disable-next-line
    console.log(`Authorize this app by visiting this url: ${authUrl}`)
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    rl.question('Enter the code from that page here: ', async code => {
        rl.close()
        try {
            const response = await oAuth2.getToken(code)
            const token = response.tokens
            oAuth2.setCredentials(token)
            await fs.writeFile(TOKEN_PATH, JSON.stringify(token))
            // tslint:disable-next-line
            console.log(green(`Token stored to %c${TOKEN_PATH}`))
            callback(oAuth2)
        } catch (e) {
            throw e
        }
    })
}

/**
 * Create .env file by interation of sheet data
 */
export async function createDotEnv(data: ISheetRow[], directory: string): Promise<void> {
    if (!directory) {
        throw new Error(red('No directory defined'))
    }
    const formatted = (result: string, row: ISheetRow) => {
        return row.key ? `${result}${row.key}=${row.value}\n` : `${result}`
    }
    const config = data.reduce(formatted, '').trim()
    try {
        await fs.writeFile(directory, config, 'utf8')
        // tslint:disable-next-line
        console.log(green(`The file has been saved to ${yellow.bold(directory)}`))
    } catch (e) {
        throw e
    }
}

/**
 * Get argument from command line after script
 * @param {string} option (-p --project | --credentails)
 */
export function getArgument(option: IArg): string {
    const index = process.argv.indexOf(option.flag)
    if (index === -1) {
        // tslint:disable-next-line
        console.warn(yellow(`Warning! ${option.flag} << ${option.name} >> option is missing, will use default value instead.`))
        return ``
    }

    return process.argv[index + 1];
}
