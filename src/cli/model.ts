
export interface IArg {
    // Flag of this argument
    flag: string
    // Readable name for message
    // Not for bussiness logic
    name: string
}

export interface ISyncConfigCI {
    base64Creds: string
    base64Token: string
    configPath: string
}