import { green, red, yellow } from 'colors'
import { promises as fs } from 'fs'
import { Credentials, OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { createInterface } from 'readline'
import { SCOPE, TOKEN_PATH } from './constant'
import { IArg, ICredentials, ISheetRow, IInstalledCredentials } from './model'
/**
 * Read value from process env and decode it
 * @param key to specify value in process env
 */
export function decodeFromEnv(key: string): any {
    const encoded = process.env[key]
    if (!encoded) {
        throw new Error(`Please define ${key} in .env`)
    }
    let result: any
    try {
        result = JSON.parse(Buffer.from(encoded, 'base64').toString())
    } catch (e) {
        throw new Error(`This value is not a JSON`)
    }
    return result
}

export function createCredentials(client_secret: string, client_id: string, redirect_uris: string[]): ICredentials {
    return {
        installed: {
            client_secret,
            client_id,
            redirect_uris,
        } as IInstalledCredentials
    } as ICredentials
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param creds google sheet credential might be service account
 * @param token google token when authorize success
 * @param callback after create oauth2 client and set token
 */
export async function authorize(creds: ICredentials, token: Credentials): Promise<OAuth2Client> {
    const {
        client_secret,
        client_id,
        redirect_uris } = creds.installed
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0])
    if (token) {
        oAuth2Client.setCredentials(token)
        return new Promise(resolve => {
            resolve(oAuth2Client)
        })
    } else {
        return getNewToken(oAuth2Client)
    }
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
export async function getNewToken(oAuth2: OAuth2Client): Promise<OAuth2Client> {
    const authUrl = oAuth2.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPE,
    })
    // tslint:disable-next-line
    console.log(green(`Authorize this app by visiting this url: ${yellow.underline(authUrl)}`))
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    return new Promise(async (resolve, rejects) => {
        rl.question('Enter the code from that page here: ', async code => {
            rl.close()
            try {
                const response = await oAuth2.getToken(code)
                const token = response.tokens
                oAuth2.setCredentials(token)
                await fs.writeFile(TOKEN_PATH, JSON.stringify(token))
                // tslint:disable-next-line
                console.log(green(`Token stored to %c${TOKEN_PATH}`))
                resolve(oAuth2)
            } catch (e) {
                rejects(e)
            }
        })
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
