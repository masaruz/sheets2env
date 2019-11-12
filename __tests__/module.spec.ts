import { SheetEnv } from '../src/module'
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