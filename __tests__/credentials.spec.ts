import { config } from "dotenv"
import { createCredentials, authorize, decodeFromEnv } from '../src/service'
import { resolve } from "path"

config({ path: resolve(__dirname, ".env.ci") })

describe('create flow of authenticate and use the googleapis', () => {
    it('create creds', () => {
        const creds = createCredentials('secrets', 'id', ['redirect'])
        expect(creds.installed.client_secret).toBe('secrets')
        expect(creds.installed.client_id).toBe('id')
        expect(creds.installed.redirect_uris).toStrictEqual(['redirect'])
    })

    it('use .env values to make authorize', async () => {
        const gSheetCreds = decodeFromEnv('GOOGLE_SHEET_CREDENTAILS')
        const gAccountToken = decodeFromEnv('GOOGLE_ACCOUNT_TOKEN')
        const { client_secret, client_id, redirect_uris } = gSheetCreds.installed
        const creds = createCredentials(client_secret, client_id, redirect_uris)
        expect(authorize(creds, gAccountToken)).resolves.not.toThrow()
    })

    it('print accounts google url for new token even put the invalid token', () => {
        const gSheetCreds = decodeFromEnv('GOOGLE_SHEET_CREDENTAILS')
        const { client_secret, client_id, redirect_uris } = gSheetCreds.installed
        const creds = createCredentials(client_secret, client_id, redirect_uris)
        expect(authorize(creds, '' as any)).resolves.not.toThrow()
    })
})