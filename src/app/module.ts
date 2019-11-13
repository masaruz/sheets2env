import { yellow } from 'colors'
import { readFileSync } from 'fs'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { has, isEmpty } from 'lodash'
import { REDIRECT_URIS, SHEET_CREDS_TEMP_PATH, GOOGLE_TOKEN_TEMP_PATH } from './constant'
import { IConfig, ICredentials, ISheetRange, IToken } from './model'
import { createDotEnv, getNewToken, range2rows } from './service'

export class SheetEnv {
    private _oAuth2Client: OAuth2Client
    private _config: IConfig
    private _token: IToken
    private _credentials: ICredentials

    get credentials(): ICredentials {
        return this._credentials
    }
    /**
     * @param credentials from google service account
     */
    set credentials(credentials: ICredentials) {
        this._credentials = credentials
    }
    /**
     * Setup credentials 
     * @param config json file to define projects and sheet id
     * @param token get from google authorization
     */
    constructor(config: IConfig, token?: IToken) {
        this._config = config
        this._token = token
    }

    public validateCreds() {
        if (!has(this.credentials, 'installed')) {
            throw new Error('Credential missing installed')
        }
        if (!has(this.credentials.installed, 'client_id')) {
            throw new Error('Credential Installed missing client_id')
        }
        if (!has(this.credentials.installed, 'client_secret')) {
            throw new Error('Credential Installed missing client_secret')
        }
    }

    public initCredentials(): void {
        // If never set credentials
        if (isEmpty(this.credentials)) {
            const creds = JSON.parse(readFileSync(SHEET_CREDS_TEMP_PATH).toString())
            this.credentials = creds
        }
        if (isEmpty(this._token)) {
            try {
                const token = JSON.parse(readFileSync(GOOGLE_TOKEN_TEMP_PATH).toString())
                this._token = token
                // tslint:disable-next-line
            } catch (e) { }
        }
        // If credential has no redirect uris
        if (!has(this.credentials.installed, 'redirect_uris') ||
            isEmpty(this.credentials.installed.redirect_uris)) {
            // Overwrite it with default
            this.credentials.installed.redirect_uris = REDIRECT_URIS
        }
    }
    /**
     * Create an OAuth2 client with the given credentials
     * Then create file(s) from configuration
     */
    public async sync(): Promise<void> {
        this.initCredentials()
        this.validateCreds()
        const {
            client_secret,
            client_id,
            redirect_uris } = this.credentials.installed
        this._oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0])
        // Use assigned token first if available
        if (has(this, ['_token', 'access_token'])) {
            this._oAuth2Client.setCredentials(this._token)
        } else {
            this._oAuth2Client = await getNewToken(this._oAuth2Client)
        }
        const gsheets = google.sheets({ version: 'v4', auth: this._oAuth2Client })
        const tabs = this._config.projects.map(project => `${project.tab}!A2:F`)
        // tslint:disable-next-line
        console.log(yellow(`Retreiving data from sheets ${tabs} ...`))
        // get from multiple tabs sheet
        let sheetdata
        try {
            sheetdata = await gsheets.spreadsheets.values.batchGet({
                ranges: tabs,
                spreadsheetId: this._config.sheetId,
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
            const pconfig = this._config.projects.find(p => p.tab === project)
            const rows = range2rows(range as ISheetRange, pconfig.column)
            createDotEnv(rows, pconfig.dest)
        })
    }
}