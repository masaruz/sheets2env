import { SheetEnv } from '../src/app/module'
import { range2rows } from '../src/app/service'
import { unlinkSync, writeFileSync } from 'fs'
import { join } from 'path'

describe('init module with config', () => {

    const dconfig = {
        projects: [
            {
                dest: '',
                tab: '',
                column: 0
            }
        ],
        sheetId: 'foo'
    }

    it('should throw the error when put empty credential', () => {
        let client = new SheetEnv({
            credentials: {} as any,
            config: dconfig
        })
        expect(() => client.validate()).toThrow()
        client = new SheetEnv({
            credentials: { installed: {} } as any,
            config: dconfig
        })
        expect(() => client.validate()).toThrow()
        client = new SheetEnv({
            credentials: { installed: { client_id: '' } } as any,
            config: dconfig
        })
        expect(() => client.validate()).toThrow()
        client = new SheetEnv({
            credentials: { installed: { client_id: '', client_secret: '' } } as any,
            config: dconfig
        })
        expect(() => client.validate()).not.toThrow()
        client = new SheetEnv({
            credentials: { installed: { client_id: '', client_secret: '', redirect_uris: [] } } as any,
            config: dconfig
        })
        expect(() => client.validate()).not.toThrow()
    })

    it('should add default redirect uris if not provided', () => {
        const client = new SheetEnv({
            credentials: {
                installed: {
                    client_id: 'xxx',
                    client_secret: 'yyy',
                    redirect_uris: []
                }
            },
            config: dconfig
        })
        expect(client.credentials.installed.redirect_uris.length).toEqual(0)
        client.init()
        const creds = client.credentials
        const { client_id, client_secret, redirect_uris } = creds.installed
        expect(client_id).toEqual('xxx')
        expect(client_secret).toEqual('yyy')
        expect(redirect_uris.length).toEqual(2)
    })

    it('no overwrite if provided redirect_uris', () => {
        const client = new SheetEnv({
            credentials: {
                installed: {
                    client_id: 'xxx',
                    client_secret: 'yyy',
                    redirect_uris: ['localhost']
                }
            },
            config: dconfig
        })
        client.init()
        const creds = client.credentials
        const { client_id, client_secret, redirect_uris } = creds.installed
        expect(client_id).toEqual('xxx')
        expect(client_secret).toEqual('yyy')
        expect(redirect_uris.length).toEqual(1)
        expect(redirect_uris[0]).toEqual('localhost')
    })

    it('should not throw the error when client sync with empty config', () => {
        const client = new SheetEnv({
            credentials: {
                installed: {
                    client_id: '',
                    client_secret: '',
                    redirect_uris: []
                }
            },
            config: dconfig
        })
        expect(() => client.sync()).not.toThrow()
    })
})

describe('manipulate data from google sheet', () => {

    const data = {
        range: 'CI!A2:F1001',
        majorDimension: 'ROWS',
        values: [
            ['PROJECT_ID', 'xxx', 'yyy', 'zzz'],
            ['APP_ENV', 'dev', 'uat', 'prd'],
            // {'env':'dev'}, {'env':'uat'}, {'env':'prd'}
            ['BASE64_ENCODED', 'eyJlbnYiOiJkZXYifQ==', 'eyJlbnYiOiJ1YXQifQ==', 'eyJlbnYiOiJwcmQifQ==']
        ]
    }

    it('return empty array when input empty data', () => {
        const rows = range2rows({ range: '', majorDimension: '', values: [] }, 1)
        expect(rows.length).toEqual(0)
    })

    it('return set of key, value according to sheet data and column', () => {
        const copied = { ...data }
        const rows = range2rows(copied, 1)
        expect(rows[0].key).toEqual('PROJECT_ID')
        expect(rows[0].value).toEqual('xxx')
        expect(rows[1].key).toEqual('APP_ENV')
        expect(rows[1].value).toEqual('dev')
        expect(rows[2].key).toEqual('BASE64_ENCODED')
        expect(rows[2].value).toEqual('eyJlbnYiOiJkZXYifQ==')
    })

    it('return set of key, value according to sheet data and column', () => {
        const copied = { ...data }
        const rows = range2rows(copied, 2)
        expect(rows[0].key).toEqual('PROJECT_ID')
        expect(rows[0].value).toEqual('yyy')
        expect(rows[1].key).toEqual('APP_ENV')
        expect(rows[1].value).toEqual('uat')
        expect(rows[2].key).toEqual('BASE64_ENCODED')
        expect(rows[2].value).toEqual('eyJlbnYiOiJ1YXQifQ==')
    })

    it('skip append to rows when no key at index 0', () => {
        const copied = {
            ...data, values: [
                ['', 'xxx', 'yyy', 'zzz'],
                ['APP_ENV', 'dev', 'uat', 'prd'],
            ]
        }
        const rows = range2rows(copied, 3)
        expect(rows.length).toEqual(1)
        expect(rows[0].key).toEqual('APP_ENV')
        expect(rows[0].value).toEqual('prd')
    })

    it('empty rows when no key at any index', () => {
        const copied = {
            ...data, values: [
                ['', 'xxx', 'yyy', 'zzz'],
                ['', 'dev', 'uat', 'prd'],
            ]
        }
        const rows = range2rows(copied, 3)
        expect(rows.length).toEqual(0)
    })
})

describe('validate projects config', () => {

    const configpath = join(__dirname, '.env.config.json')

    afterEach(() => {
        // Incase of some tests don't create .env
        try {
            unlinkSync(configpath)
            // tslint:disable-next-line
        } catch (e) { }
    })

    it('let module use config from a config file', () => {
        writeFileSync(configpath, JSON.stringify({
            projects: [
                {
                    dest: '',
                    tab: '',
                    column: 0
                }
            ],
            sheetId: 'foo'
        }))
        const client = new SheetEnv({
            credentials: {
                installed: {
                    client_id: 'xxx',
                    client_secret: 'yyy',
                    redirect_uris: ['localhost']
                }
            },
            configPath: configpath
        })
        expect(() => client.init()).not.toThrow()
        expect(() => client.validate()).not.toThrow()
    })
})