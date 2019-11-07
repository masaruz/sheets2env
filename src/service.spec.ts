import { decodeFromEnv } from './service'

describe('decod from env', () => {
    test('throw errro when value not found', async () => {
        expect(() => decodeFromEnv('')).toThrow()
    })

    test('return object when value found', () => {
        process.env['KEY'] = 'eyJuYW1lIjoic3RhbXAifQ==' // {"name":"stamp"}
        const obj = decodeFromEnv('KEY')
        expect(obj.name).toBe('stamp')
    })

    test('throw errro when value is not an object', () => {
        process.env['KEY'] = 'aGVsbG8=' // hello
        expect(() => decodeFromEnv('KEY')).toThrow()
    })
})