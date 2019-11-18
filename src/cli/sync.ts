import { SheetsEnv } from '../app'
import { ISyncConfigCI } from './model'
import { base64ToJson } from './service'

export const sync = () => new SheetsEnv().sync()

export const syncCI = (config: ISyncConfigCI) => new SheetsEnv(
    {
        configPath: config.configPath,
        credentials: base64ToJson(config.base64Creds),
        token: base64ToJson(config.base64Token),
    },
).sync()