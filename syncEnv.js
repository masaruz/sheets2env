require('dotenv').config()

const fs = require('fs')
const readline = require('readline')
const { google } = require('googleapis')

const ARGS = {
    ENVIRONMENT: { FLAG: '-env', NAME: 'environment' },
    CONFIG: { FLAG: '-c', NAME: 'config' }
}

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
const TOKEN_PATH = 'google.token'
// Use from .env or export in console
const GOOGLE_SHEET_CREDENTAILS = decodeFromEnv('GOOGLE_SHEET_CREDENTAILS')
const GOOGLE_ACCOUNT_TOKEN = decodeFromEnv('GOOGLE_ACCOUNT_TOKEN')
const CONFIG = JSON.parse(fs.readFileSync(getArgument(ARGS.CONFIG) || './scripts/config.json'))

if (CONFIG.projects.length <= 0) {
    throw new Error(`projects in config is required`)
}

const APP_ENV = getArgument(ARGS.ENVIRONMENT) || 'development'
const PREFERED_COLUM =
    APP_ENV === 'production' ? 5 :
        APP_ENV === 'uat' ? 3 :
            1 // 1 is default

// gsheet link: https://docs.google.com/spreadsheets/d/13BXve27SFSyX4u0MSHmzY92mZ2dgpjM1zrMwtaalb3g/edit#gid=1825594893
const SHEET_ID = `13BXve27SFSyX4u0MSHmzY92mZ2dgpjM1zrMwtaalb3g`

authorize(GOOGLE_SHEET_CREDENTAILS, listMajors)

/**
 * Decode value from process.env
 * @param {string} key
 */
function decodeFromEnv(key) {
    const encoded = process.env[key]
    if (!encoded)
        throw new Error(`Please define ${key} in .env`)
    return JSON.parse(Buffer.from(encoded, 'base64').toString())
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0])

    if (GOOGLE_ACCOUNT_TOKEN) {
        oAuth2Client.setCredentials(GOOGLE_ACCOUNT_TOKEN)
        callback(oAuth2Client)
        // } else if (TOKEN_PATH) {
        //     fs.readFile(TOKEN_PATH, (err, token) => {
        //         if (err) return getNewToken(oAuth2Client, callback)
        //         oAuth2Client.setCredentials(JSON.parse(token))
        //         callback(oAuth2Client)
        //     })
        //     // Otherwise popup google consent dialog to request permission
        //     // Generate TOKEN_PATH file name when successful authorized
        // }
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
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    })
    console.log('Authorize this app by visiting this url:', authUrl)
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close()
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err)
            oAuth2Client.setCredentials(token)
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err)
                console.log('Token stored to', TOKEN_PATH)
            })
            callback(oAuth2Client)
        })
    })
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
    const sheets = google.sheets({ version: 'v4', auth })
    const tabs = CONFIG.projects.map(project => `${project.name}!A2:F`)
    console.info(`Retreive data from sheets ${tabs}`)
    // get from multiple tabs sheet
    sheets.spreadsheets.values.batchGet({
        spreadsheetId: SHEET_ID,
        ranges: tabs,
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err)
        const data = res.data.valueRanges
        if (data.length > 0) {
            data.forEach(range => {
                // project's name ex. backend, scoreup, scoreup-people
                const project = range.range.split(`!`)[0].replace(/\'/g, '')
                const rows = range.values
                createDotEnv(
                    rows.map(row => {
                        const key = row[0]
                        const value = row[PREFERED_COLUM]
                        if (!value)
                            throw new Error(`Value of ${key} is not defined`)
                        return { key, value }
                    }), CONFIG.projects.find(p => p.name === project).dest)
            })
        } else {
            console.log('No data found.')
        }
    })
}

/**
 * Each object has key and value
 * @param {array} data 
 * @param {string} directory
 */
function createDotEnv(data, directory) {
    const formatted = (result, row) => {
        return row.key ? `${result}${row.key}=${row.value}\n` : `${result}`
    }
    const config = data.reduce(formatted, '')
    fs.writeFile(directory, config, 'utf8', (err) => {
        if (err) throw err
        console.log(`The file has been saved to ${directory}`)
    })
}

/**
 * Get argument from command line after script
 * @param {string} option (-p --project | --credentails)
 */
function getArgument(option) {
    const index = process.argv.indexOf(option.FLAG)
    if (index == -1) {
        console.warn(`\x1b[33m%s\x1b[0m`, `Warning! ${option.FLAG} << ${option.NAME} >> option is missing, will use default value instead.`)
        return ``
    }

    return process.argv[index + 1];
}