import { green, yellow } from 'colors'
import { readFileSync, writeFileSync } from 'fs'
import { prompt } from 'inquirer'
import { filter, findIndex, map } from 'lodash'
import { IConfig, IProject } from '../app/model'
import {
    ADD_PROJECT,
    DELETE_PROJECT,
    DONE,
    EDIT_COLUMN,
    EDIT_DEST_PATH,
    EDIT_PROJECTS,
    EDIT_SHEETS_ID,
    EDIT_TAB,
} from './constant'
import { IArg } from './model'
import {
    QUESTION_COLUMN,
    QUESTION_DEST_NAME,
    QUESTION_SHEETS_ID,
    QUESTION_TAB,
} from './question'

/**
 * Use native file system to write in synchronous
 * @param path directory and filename 
 * @param config content
 */
export function writeConfigFile(path: string, config: IConfig) {
    writeFileSync(path, JSON.stringify(config, null, 4))
}

/**
 * Create google credentials to targeted location
 * @param path directory and filename 
 */
export async function createGoogleCredentials(path: string): Promise<void> {
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
    writeFileSync(path, JSON.stringify({
        installed: answers,
    }, null, 4))
}

/**
 * Create config for a single project
 * User can edit this config manaully or use `$ sheets2env config` command
 * edit command can add or delete a project from this config
 * @param path directory and filename 
 */
export async function createProjectConfigs(path: string): Promise<void> {
    const answers = await prompt([
        QUESTION_SHEETS_ID,
        QUESTION_TAB,
        QUESTION_COLUMN,
        QUESTION_DEST_NAME,
    ])
    writeFileSync(path, JSON.stringify({
        projects: [
            {
                column: +answers.column,
                dest: answers.dest,
                tab: answers.tab,
            },
        ],
        sheetId: answers.sheetId,
    }, null, 4))
}
/**
 * Choose a method ex. SheetId, Add, Delete
 * User can edit this config manaully or use `$ sheets2env config` command
 * edit command can add or delete a project from this config
 * @param path directory and filename 
 */
export async function editProjectConfigs(path: string): Promise<void> {
    while (true) {
        const pconfig: IConfig = JSON.parse(readFileSync(path).toString())
        const { method } = await prompt([{
            choices: [EDIT_SHEETS_ID, EDIT_PROJECTS, DONE],
            message: 'What do you want to configure ?',
            name: 'method',
            type: 'list',
        }])
        switch (method) {
            case EDIT_SHEETS_ID:
                const { sheetId } = await prompt([
                    QUESTION_SHEETS_ID,
                ])
                pconfig.sheetId = sheetId
                break
            case EDIT_PROJECTS:
                const pchoices: string[] = pconfig.projects.map(p => p.tab)
                const choices = [...pchoices]
                choices.push(ADD_PROJECT)
                choices.push(DELETE_PROJECT)
                const { project } = await prompt([
                    {
                        choices,
                        message: 'Which project or options do you want to configure ?',
                        name: 'project',
                        type: 'list',
                    },
                ])
                pconfig.projects = await editProjects(project, pconfig.projects)
                break
            default:
                writeConfigFile(path, pconfig)
                process.exit(0)
        }
        writeConfigFile(path, pconfig)
        // tslint:disable-next-line
        console.log(green.bold(`${method} successfully and have been saved to ${yellow.underline(path)} !`))
        // Deley next command
        await new Promise(resolve => setTimeout(resolve, 1000))
    }
}

/**
 * Choose a method ex. Tab, Column, File destination 
 * User can edit this config manaully or use `$ sheets2env config` command
 * edit command can add or delete a project from this config
 * @param path directory and filename 
 */
export async function editProjects(choice: string, current: IProject[]): Promise<IProject[]> {
    let projects = [...current]
    switch (choice) {
        case ADD_PROJECT:
            const added = await prompt([
                QUESTION_TAB,
                QUESTION_COLUMN,
                QUESTION_DEST_NAME,
            ])
            projects.push({
                column: +added.column,
                dest: added.dest as string,
                tab: added.tab as string,
            })
            break
        case DELETE_PROJECT:
            const { deleted_project } = await prompt([
                {
                    choices: map(projects, p => p.tab),
                    message: 'Which project do you want to configure ?',
                    name: 'deleted_project',
                    type: 'list',
                },
            ])
            projects = filter(projects, p => p.tab !== deleted_project)
            break
        default:
            const index = findIndex(projects, p => p.tab === choice)
            const { what } = await prompt([{
                choices: [
                    EDIT_COLUMN,
                    EDIT_TAB,
                    EDIT_DEST_PATH,
                ],
                message: `What do you want to configure in ${projects[index].tab} ?`,
                name: 'what',
                type: 'list',
            }])
            projects[index] = await editProject(what, projects[index])
    }
    return projects
}

/**
 * Edit a project config ex. Tab, Column, File destination 
 * User can edit this config manaully or use `$ sheets2env config` command
 * edit command can add or delete a project from this config
 * @param path directory and filename 
 */
export async function editProject(choice: string, current: IProject): Promise<IProject> {
    const project = { ...current }
    switch (choice) {
        case EDIT_COLUMN:
            const { column } = await prompt([
                QUESTION_COLUMN,
            ])
            project.column = +column
            break
        case EDIT_TAB:
            const { tab } = await prompt([
                QUESTION_TAB,
            ])
            project.tab = tab
            break
        case EDIT_DEST_PATH:
            const { dest } = await prompt([
                QUESTION_DEST_NAME,
            ])
            project.dest = dest
            break
    }
    return project
}
/**
 * Get argument from command line after script
 * @param {string} option (-p --project | --credentails)
 */
export function getArgument(option: IArg): string {
    const index = process.argv.indexOf(option.flag)
    if (index === -1) {
        // tslint:disable-next-line
        console.log(yellow(`Warning! ${option.flag} << ${option.name} >> option is missing, will use default value instead.`))
        return ``
    }

    return process.argv[index + 1]
}
/**
 * Decode from process.env
 */
export function base64ToJson(encoded: string): any {
    let result
    try {
        result = JSON.parse(Buffer.from(encoded, 'base64').toString())
    } catch (e) {
        throw new Error(`This value is not a JSON`)
    }
    return result
}