import { isNumber } from 'util'

export const QUESTION_COLUMN = {
    message: 'Please type your google sheets column (0 is Key column):',
    name: 'column',
    validate: async (input: string) => {
        if (isNumber(input)) {
            return 'Sheets column must be a number'
        }
        if (+input === 0) {
            return '0 is reserve for sheets Key column'
        }
        return true
    },
}

export const QUESTION_SHEETS_ID = {
    message: 'Please type your google sheets id:',
    name: 'sheetId',
}

export const QUESTION_TAB = {
    message: 'Please type your google sheets tab name:',
    name: 'tab',
}

export const QUESTION_DEST_NAME = {
    default: '.env',
    message: 'Please type your file name (.env is default):',
    name: 'dest',
}