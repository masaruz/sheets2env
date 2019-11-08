export interface ICredentials {
    installed: IInstalledCredentials
}

export interface IInstalledCredentials {
    client_secret: string
    client_id: string
    redirect_uris: string[]
}

export interface ISheetRow {
    key: string
    value: string
}

export interface IArg {
    flag: string
    name: string
}

export interface IConfig {
    projects: IProject[]
    sheetId: string
}

export interface IProject {
    // Where is the project directory
    dest: string
    // Sheet tab
    tab: string
    // Sheet column
    column: number
}