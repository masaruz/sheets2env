import {
    existsSync,
    mkdirSync,
} from 'fs'
import { prompt } from 'inquirer'
import {
    CONFIG_PATH,
    SHEETS_CONFIG_PATH,
    SHEETS_CREDS_PATH,
} from '../app/constant'
import {
    CREATE_GOOGLE_SHEETS_CONFIG,
    CREATE_PROJECT_CONFIG,
    EDIT_PROJECT_CONFIG,
    EXIT,
    SYNC_PROJECTS,
} from './constant'
import {
    createGoogleCredentials,
    createProjectConfigs,
    editProjectConfigs,
} from './service'
import { sync } from './sync'

export async function config(): Promise<void> {
    const choices = [
        CREATE_PROJECT_CONFIG,
        CREATE_GOOGLE_SHEETS_CONFIG,
        EXIT,
    ]
    if (!existsSync(CONFIG_PATH)) {
        mkdirSync(CONFIG_PATH)
    }
    if (existsSync(SHEETS_CONFIG_PATH)) {
        choices.unshift(EDIT_PROJECT_CONFIG)
        choices.unshift(SYNC_PROJECTS)
    }
    const answers = await prompt([
        {
            choices,
            message: 'What do you want ?',
            name: 'what',
            type: 'list',
        },
    ])
    switch (answers.what) {
        case CREATE_GOOGLE_SHEETS_CONFIG:
            await createGoogleCredentials(SHEETS_CREDS_PATH)
            break
        case CREATE_PROJECT_CONFIG:
            await createProjectConfigs(SHEETS_CONFIG_PATH)
            break
        case EDIT_PROJECT_CONFIG:
            await editProjectConfigs(SHEETS_CONFIG_PATH)
            break
        case SYNC_PROJECTS:
            await sync()
        default:
            process.exit(0)
    }
    if (!existsSync(SHEETS_CREDS_PATH)) {
        await createGoogleCredentials(SHEETS_CREDS_PATH)
    }
    if (!existsSync(SHEETS_CONFIG_PATH)) {
        await createProjectConfigs(SHEETS_CONFIG_PATH)
    }
}