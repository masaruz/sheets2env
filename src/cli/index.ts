import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { prompt } from 'inquirer'
import { CONFIG_PATH, SHEET_CREDS_PATH } from '../app/constant'

prompt([
    {
        message: 'Please type your google sheet client_id:',
        name: 'client_id',
        type: 'password',
    },
    {
        message: 'Please type your google sheet client_secret:',
        name: 'client_secret',
        type: 'password',
    },
]).then(answers => {
    if (!existsSync(CONFIG_PATH)) {
        mkdirSync(CONFIG_PATH)
    }
    writeFileSync(SHEET_CREDS_PATH, JSON.stringify({
        installed: answers,
    }))
})