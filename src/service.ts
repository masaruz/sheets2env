import { green, red, yellow } from 'colors'
import { promises as fs } from 'fs'
import { OAuth2Client } from 'google-auth-library'
import { createInterface } from 'readline'
import { SCOPE, TOKEN_PATH } from './constant'
import { IArg, ISheetRow } from './model'

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
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
        console.log(yellow(`Warning! ${option.flag} << ${option.name} >> option is missing, will use default value instead.`))
        return ``
    }

    return process.argv[index + 1]
}
