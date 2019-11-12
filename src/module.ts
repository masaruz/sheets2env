import { yellow } from 'colors'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { IConfig, ICredentials, IToken } from './model'
import { createDotEnv, getNewToken } from './service'

export class SheetEnv {
    private oAuth2Client: OAuth2Client
    private credentials: ICredentials
    private config: IConfig
    private token: IToken
    /**
     * Set credentials to this class
     * @param credentials from google service account
     * @param config json file to define projects and sheet id
     * @param token get from google authorization
     */
    constructor(credentials: ICredentials, config: IConfig, token: IToken = {
        access_token: '',
        expiry_date: 0,
        refresh_token: '',
        scope: '',
        token_type: '',
    }) {
        this.credentials = credentials
        this.config = config
        this.token = token
    }
    /**
     * Create an OAuth2 client with the given credentials
     * Then create file(s) from configuration
     */
    public async sync() {
        const {
            client_secret,
            client_id,
            redirect_uris } = this.credentials.installed
        this.oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0])
        // Use assigned token first if available
        if (this.token.access_token) {
            this.oAuth2Client.setCredentials(this.token)
        } else {
            this.oAuth2Client = await getNewToken(this.oAuth2Client)
        }
        const gsheets = google.sheets({ version: 'v4', auth: this.oAuth2Client })
        const tabs = this.config.projects.map(project => `${project.tab}!A2:F`)
        // tslint:disable-next-line
        console.log(yellow(`Retreiving data from sheets ${tabs} ...`))
        // get from multiple tabs sheet
        let sheetdata
        try {
            sheetdata = await gsheets.spreadsheets.values.batchGet({
                ranges: tabs,
                spreadsheetId: this.config.sheetId,
            })
        } catch (e) {
            throw new Error(e)
        }
        const data = sheetdata.data.valueRanges
        if (data.length <= 0) {
            // tslint:disable-next-line
            throw new Error('No data found.')
        }
        data.forEach(range => {
            // project's name ex. backend, scoreup, scoreup-people
            const project = range.range.split(`!`)[0].replace(/\'/g, '')
            const rows = range.values
            // project's configuration from config file
            const pconfig = this.config.projects.find(p => p.tab === project)
            createDotEnv(
                rows.map(row => {
                    const key = row[0]
                    const value = row[pconfig.column]
                    if (!value) {
                        throw new Error(`Value of ${key} is not defined`)
                    }
                    return { key, value }
                }), pconfig.dest)
        })
    }
}