import { yellow } from 'colors'
import { readFileSync } from 'fs'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { has, isEmpty } from 'lodash'
import { GOOGLE_TOKEN_PATH, REDIRECT_URIS, SHEETS_CONFIG_PATH, SHEETS_CREDS_PATH } from './constant'
import { IConfig, ICredentials, IModuleConfig, ISheetRange, IToken } from './model'
import { createDotEnv, getNewToken, range2rows } from './service'

export class SheetsEnv {
    private _oAuth2Client: OAuth2Client
    private _config: IConfig
    private _configPath: string
    private _token: IToken
    private _tokenPath: string
    private _credentials: ICredentials
    private _credentialsPath: string

    get credentials(): ICredentials {
        return this._credentials
    }
    /**
     * Setup credentials 
     * @param config json file to define projects and sheet id
     */
    constructor(mconfig?: IModuleConfig) {
        if (!isEmpty(mconfig)) {
            this._config = mconfig.config
            this._configPath = mconfig.configPath

            this._credentials = mconfig.credentials
            this._credentialsPath = mconfig.credentialsPath

            this._token = mconfig.token
            this._tokenPath = mconfig.tokenPath
        }
    }

    public validate() {
        if (!has(this._credentials, 'installed')) {
            throw new Error('Credential missing installed')
        }
        if (!has(this._credentials.installed, 'client_id')) {
            throw new Error('Credential Installed missing client_id')
        }
        if (!has(this._credentials.installed, 'client_secret')) {
            throw new Error('Credential Installed missing client_secret')
        }
        if (!has(this._config, 'sheetId') || isEmpty(this._config.sheetId)) {
            throw new Error('SheetId must be specified')
        }
        if (!has(this._config, 'projects') || isEmpty(this._config.projects)) {
            throw new Error('Project in config must be specified at least 1')
        }
    }

    public init(): void {
        // If never set credentials
        if (isEmpty(this._credentials)) {
            const path = this._credentialsPath || SHEETS_CREDS_PATH
            const creds = JSON.parse(readFileSync(path).toString())
            this._credentials = creds
        }
        // If credential has no redirect uris
        if (!has(this._credentials.installed, 'redirect_uris') ||
            isEmpty(this._credentials.installed.redirect_uris)) {
            // Overwrite it with default
            this._credentials.installed.redirect_uris = REDIRECT_URIS
        }
        if (isEmpty(this._token)) {
            // Allow to be crash 
            // For asking user authentication
            try {
                const path = this._tokenPath || GOOGLE_TOKEN_PATH
                const token = JSON.parse(readFileSync(path).toString())
                this._token = token
                // tslint:disable-next-line
            } catch (e) { }
        }
        if (isEmpty(this._config)) {
            const path = this._configPath || SHEETS_CONFIG_PATH
            const config = JSON.parse(readFileSync(path).toString())
            this._config = config
        }
    }
    /**
     * Create an OAuth2 client with the given credentials
     * Then create file(s) from configuration
     */
    public async sync(): Promise<void> {
        this.init()
        this.validate()
        const {
            client_secret,
            client_id,
            redirect_uris } = this._credentials.installed
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