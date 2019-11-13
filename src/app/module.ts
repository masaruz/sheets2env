import { yellow } from 'colors'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { has } from 'lodash'
import { REDIRECT_URIS } from './constant'
import { IConfig, ICredentials, ISheetRange, IToken } from './model'
import { createDotEnv, getNewToken, range2rows } from './service'

export class SheetEnv {
    private oAuth2Client: OAuth2Client
    private credentials: ICredentials
    private config: IConfig
    private token: IToken
    /**
     * Setup credentials 
     * @param credentials from google service account
     * @param config json file to define projects and sheet id
     * @param token get from google authorization
     */
    constructor(credentials: ICredentials, config: IConfig, token?: IToken) {
        this.validateCreds(credentials)
        this.credentials = credentials
        this.config = config
        this.token = token
    }
    /**
     * Return credentails of this class
     */
    public getCredentials(): ICredentials {
        return this.credentials
    }
    /**
     * Validate if credentials has required attributes
     * @param credentials google sheet credentials
     */
    private validateCreds(credentials: ICredentials) {
        if (!has(credentials, 'installed')) {
            throw new Error('Credential missing installed')
        }
        if (!has(credentials.installed, 'client_id')) {
            throw new Error('Credential Installed missing client_id')
        }
        if (!has(credentials.installed, 'client_secret')) {
            throw new Error('Credential Installed missing client_secret')
        }
        if (!has(credentials.installed, 'redirect_uris') ||
            credentials.installed.redirect_uris.length === 0) {
            // Overwrite it with default
            credentials.installed.redirect_uris = REDIRECT_URIS
        }
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
        if (has(this, ['token', 'access_token'])) {
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
            // project's configuration from config file
            const pconfig = this.config.projects.find(p => p.tab === project)
            const rows = range2rows(range as ISheetRange, pconfig.column)
            createDotEnv(rows, pconfig.dest)
        })
    }
}