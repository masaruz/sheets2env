import { createDotEnv, range2rows } from '../src/app/service'
import { join } from 'path'
import { unlinkSync, readFileSync } from 'fs'

describe('create dotenv from the result of range2row', () => {
    const envpath = join(__dirname, '.env.integration')

    afterEach(() => {
        // Incase of some tests don't create .env
        try {
            unlinkSync(envpath)
            // tslint:disable-next-line
        } catch (e) { }
    })

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
    it('create a file with sheet column 1', async () => {
        const rows = range2rows({ ...data }, 1)
        await createDotEnv(rows, envpath)
        const rawdata = readFileSync(envpath)
        const lines = rawdata.toString().split('\n')
        expect(lines.length).toBe(3)

        const line1 = lines[0].split(/=(.+)/)
        expect(line1[0]).toBe('PROJECT_ID')
        expect(line1[1]).toBe('xxx')

        const line2 = lines[1].split(/=(.+)/)
        expect(line2[0]).toBe('APP_ENV')
        expect(line2[1]).toBe('dev')

        const line3 = lines[2].split(/=(.+)/)
        expect(line3[0]).toBe('BASE64_ENCODED')
        expect(line3[1]).toBe('eyJlbnYiOiJkZXYifQ==')
    })

    it('create a file with sheet column 2', async () => {
        const rows = range2rows({ ...data }, 2)
        await createDotEnv(rows, envpath)
        const rawdata = readFileSync(envpath)
        const lines = rawdata.toString().split('\n')
        expect(lines.length).toBe(3)

        const line1 = lines[0].split(/=(.+)/)
        expect(line1[0]).toBe('PROJECT_ID')
        expect(line1[1]).toBe('yyy')

        const line2 = lines[1].split(/=(.+)/)
        expect(line2[0]).toBe('APP_ENV')
        expect(line2[1]).toBe('uat')

        const line3 = lines[2].split(/=(.+)/)
        expect(line3[0]).toBe('BASE64_ENCODED')
        expect(line3[1]).toBe('eyJlbnYiOiJ1YXQifQ==')
    })
})