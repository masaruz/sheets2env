import { writeFileSync } from 'fs'
import { prompt } from 'inquirer'
import { SHEET_CREDS_TEMP_PATH } from '../app/constant'

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
    writeFileSync(SHEET_CREDS_TEMP_PATH, JSON.stringify({
        installed: answers,
    }))
})