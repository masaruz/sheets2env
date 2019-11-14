// Keep all constants of this module
import { homedir } from 'os'
import { join } from 'path'

export const SCOPE = ['https://www.googleapis.com/auth/spreadsheets.readonly']
export const REDIRECT_URIS = [
    'urn:ietf:wg:oauth:2.0:oob',
    'http://localhost',
]

export const CONFIG_PATH = join(homedir(), '.sheets2env')
export const SHEETS_CREDS_PATH = join(CONFIG_PATH, 'credentials')
export const GOOGLE_TOKEN_PATH = join(CONFIG_PATH, 'google-token')
export const SHEETS_CONFIG_PATH = 'sheets2env.config.json'

