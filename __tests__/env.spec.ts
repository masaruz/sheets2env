import { base64ToJson } from '../src/cli/service'
import { createDotEnv } from '../src/app/service'
import { ISheetsRow } from '../src/app/model'
import { join } from 'path'
import { readFileSync, unlinkSync } from 'fs'

describe('create dot env', () => {
    const envpath = join(__dirname, '.env.unit')

    afterEach(() => {
        // Incase of some tests don't create .env
        try {
            unlinkSync(envpath)
            // tslint:disable-next-line
        } catch (e) { }
    })

    test('throw error not provide dir', async () => {
        await expect(createDotEnv([
            {
                key: 'name',
                value: 'stamp'
            }
        ] as ISheetsRow[], '')).rejects.toThrow()
    })

    test('throw error when neither provide data nor dir', async () => {
        await expect(createDotEnv(undefined, '')).rejects.toThrow()
    })

    test('throw error if provide invalid dir', async () => {
        await expect(createDotEnv([
            {
                key: 'name',
                value: 'stamp'
            }
        ] as ISheetsRow[], '.')).rejects.toThrow()
    })

    test('key and value defined properly', async () => {
        await createDotEnv([
            {
                key: 'name',
                value: 'stamp'
            }
        ] as ISheetsRow[], envpath)
        const rawdata = readFileSync(envpath)
        const lines = rawdata.toString().split('\n')
        const data = lines[0].split('=')
        expect(lines.length).toBe(1)
        expect(data[0]).toBe('name')
        expect(data[1]).toBe('stamp')
    })

    test('no key no writing', async () => {
        await createDotEnv([
            {
                key: 'name',
                value: 'stamp'
            },
            {
                value: 'masaruz'
            }
        ] as ISheetsRow[], envpath)
        const rawdata = readFileSync(envpath)
        const lines = rawdata.toString().split('\n')
        const data = lines[0].split('=')
        expect(lines.length).toBe(1)
        expect(data[0]).toBe('name')
        expect(data[1]).toBe('stamp')
    })

    test('no key no writing', async () => {
        await createDotEnv([
            {
                key: 'name1',
                value: 'stamp'
            },
            {
                key: 'name2',
                value: 'masaruz'
            }
        ] as ISheetsRow[], envpath)
        const rawdata = readFileSync(envpath)
        const lines = rawdata.toString().split('\n')
        const data1 = lines[0].split('=')
        const data2 = lines[1].split('=')
        expect(lines.length).toBe(2)
        expect(data1[0]).toBe('name1')
        expect(data1[1]).toBe('stamp')
        expect(data2[0]).toBe('name2')
        expect(data2[1]).toBe('masaruz')
    })
})

describe('decod from env', () => {
    test('throw errro when value not found', async () => {
        expect(() => base64ToJson('')).toThrow()
    })

    test('return object when value found', () => {
        // {"name":"stamp"}
        const obj = base64ToJson('eyJuYW1lIjoic3RhbXAifQ==')
        expect(obj.name).toBe('stamp')
    })

    test('throw errro when value is not an object', () => {
        // hello
        expect(() => base64ToJson('aGVsbG8=')).toThrow()
    })
})