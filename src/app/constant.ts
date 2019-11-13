// Keep all constants of this module
import { tmpdir } from 'os'
import { join } from 'path'

export const SCOPE = ['https://www.googleapis.com/auth/spreadsheets.readonly']
export const REDIRECT_URIS = [
    'urn:ietf:wg:oauth:2.0:oob',
    'http://localhost',
]

export const SHEET_CREDS_TEMP_PATH = join(tmpdir(), 'env-from-sheet-creds')
export const GOOGLE_TOKEN_TEMP_PATH = join(tmpdir(), 'env-from-sheet-google-token')

