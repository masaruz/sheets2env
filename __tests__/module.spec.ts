import { SheetEnv } from '../src/app/module'
import { range2rows } from '../src/app/service'

describe('init module with config', () => {
    it('should throw the error when put empty credential', () => {
        expect(() => new SheetEnv({} as any, {} as any)).toThrow()
        expect(() => new SheetEnv({ installed: {} } as any, {} as any)).toThrow()
        expect(() => new SheetEnv({ installed: { client_id: '' } } as any, {} as any)).toThrow()
        expect(() => new SheetEnv({ installed: { client_id: '', client_secret: '' } } as any, {} as any)).toThrow()
        expect(() => new SheetEnv({ installed: { client_id: '', client_secret: '', redirect_uris: [] } }, {} as any)).not.toThrow()
    })

    it('should not throw the error when client sync with empty config', () => {
        const client = new SheetEnv({
            installed: {
                client_id: '',
                client_secret: '',
                redirect_uris: []
            }
        }, {} as any)

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