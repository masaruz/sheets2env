export interface ICredentials {
    installed: IInstalledCredentials;
}

export interface IInstalledCredentials {
    client_secret: string;
    client_id: string;
    redirect_uris: string[];
}

export interface ISheetRow {
    key: string;
    value: string
}

export interface IArg {
    flag: string;
    name: string;
}