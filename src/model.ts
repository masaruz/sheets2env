export interface ICredentials {
    installed: IInstalledCredentials;
}

export interface IJson {
    [name: string]: IJsonItem;
}

interface IInstalledCredentials {
    client_secret: string;
    client_id: string;
    redirect_uris: string[];
}

interface IJsonItem {
    vars: string[];
    smps: string[];
    data: string[];
}