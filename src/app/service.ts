import { green, red, yellow } from 'colors'
import { writeFileSync } from 'fs'
import { OAuth2Client } from 'google-auth-library'
import { find, isEmpty, reduce, without } from 'lodash'
import { createInterface } from 'readline'
import { GOOGLE_TOKEN_PATH, SCOPE } from './constant'
import { IProject, ISheetRange, ISheetsRow } from './model'

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
                writeFileSync(GOOGLE_TOKEN_PATH, JSON.stringify(token, null, 4))
                // tslint:disable-next-line
                console.log(green(`Token stored to ${GOOGLE_TOKEN_PATH}`))
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
export async function createDotEnv(data: ISheetsRow[], directory: string): Promise<void> {
    if (!directory) {
        throw new Error(red('No directory defined'))
    }
    const formatted = (result: string, row: ISheetsRow) => {
        return row.key ? `${result}${row.key}=${row.value}\n` : `${result}`
    }
    const config = data.reduce(formatted, '').trim()
    try {
        writeFileSync(directory, config, 'utf8')
        // tslint:disable-next-line
        console.log(green(`The file has been saved to ${yellow.bold(directory)}`))
    } catch (e) {
        throw e
    }
}

export function range2rows(range: ISheetRange, column: number): ISheetsRow[] {
    return reduce(range.values, (rows, row) => {
        const key = row[0]
        if (isEmpty(key)) {
            return rows
        }
        const value = row[column]
        if (!value) {
            throw new Error(`Value of ${key} is not defined`)
        }
        return rows.concat([{ key, value }])
    }, [])
}

export function find2remove(projects: IProject[], tab: string): [IProject[], IProject] {
    const found = find(projects, { tab })
    return [without(projects, found), found]
}