/**
 * Receive this token after authenticated with google 
 * and accept to the policy 
 */
export interface IToken {
    access_token: string
    expiry_date: number
    refresh_token: string
    scope: string
    token_type: string
}

export interface ICredentials {
    installed: IInstalledCredentials
}

export interface IInstalledCredentials {
    client_secret: string
    client_id: string
    redirect_uris?: string[]
}

export interface ISheetsRow {
    key: string
    value: string
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

export interface ISheetRange {
    range: string
    majorDimension: string
    values: string[][]
}

export interface IModuleConfig {
    config?: IConfig
    credentials?: ICredentials
    token?: IToken
    tokenPath?: string
    credentialsPath?: string
    configPath?: string
}