import { SheetsEnv } from '../app'

const client = new SheetsEnv()

export const sync = () => client.sync()