import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { prompt } from 'inquirer'
import { isNumber } from 'util'
import { CONFIG_PATH, SHEETS_CONFIG_PATH, SHEETS_CREDS_PATH } from '../app/constant'
import { CREATE_GOOGLE_SHEETS_CONFIG, CREATE_PROJECT_CONFIG, EXIT } from './constant'

async function editGoogleCredentials(): Promise<void> {
    const answers = await prompt([
        {
            message: 'Please type your google sheets client_id:',
            name: 'client_id',
            type: 'password',
        },
        {
            message: 'Please type your google sheets client_secret:',
            name: 'client_secret',
            type: 'password',
        },
    ])
    if (!existsSync(CONFIG_PATH)) {
        mkdirSync(CONFIG_PATH)
    }
    writeFileSync(SHEETS_CREDS_PATH, JSON.stringify({
        installed: answers,
    }, null, 4))
}

async function editProjectConfigs(): Promise<void> {
    const answers = await prompt([
        {
            message: 'Please type your google sheets id:',
            name: 'sheetId',
        },
        {
            message: 'Please type your google sheets tab name:',
            name: 'tab',
        },
        {
            message: 'Please type your google sheets column (0 is Key column):',
            name: 'column',
            validate: async (input) => {
                if (isNumber(input)) {
                    return 'Sheets column must be a number'
                }
                if (Number(input) === 0) {
                    return '0 is reserve for sheets Key column'
                }
                return true
            },
        },
    ])
    writeFileSync(SHEETS_CONFIG_PATH, JSON.stringify({
        projects: [
            {
                column: Number(answers.column),
                dest: '.env',
                tab: answers.tab,
            },
        ],
        sheetId: answers.sheetId,
    }, null, 4))
}

export async function init(): Promise<void> {
    const answers = await prompt([
        {
            choices: [CREATE_PROJECT_CONFIG, CREATE_GOOGLE_SHEETS_CONFIG, EXIT],
            message: 'Can I help you ?',
            name: 'what',
            type: 'list',
        },
    ])
    switch (answers.what) {
        case CREATE_GOOGLE_SHEETS_CONFIG:
            await editGoogleCredentials()
            break
        case CREATE_PROJECT_CONFIG:
            await editProjectConfigs()
            break
        default:
    }
    if (!existsSync(SHEETS_CREDS_PATH)) {
        await editGoogleCredentials()
    }
    if (!existsSync(SHEETS_CONFIG_PATH)) {
        await editProjectConfigs()
    }
}