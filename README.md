## Installation

#### With [npm](https://npmjs.com)

```
npm install --save-dev sheets2env
```
## Setup & Usage
```
$ sheets2env init
```
##### Sync your sheet to ```your_project/.env```
```
$ sheets2env sync
```
##### Or you can call in script
```js
import { SheetsEnv } from 'sheets2env'

const client = new SheetsEnv()
await client.sync()
```
## Example of token file

```js
// This file is auto generated after sync()
// This file is placed to ~/.sheets2env/google-token
{
    "access_token": "...",
    "expiry_date":  1573214579858,
    "refresh_token": "...",
    "scope":        "https://www.googleapis.com/auth/spreadsheets.readonly",
    "token_type":   "Bearer",
}
```

## Google Sheet Structure
##### From this table we decalre column ```develop``` as ```{column:1}``` and ```uat``` as ```{column:2}``` and ```production``` as ```{column:3}```

key | develop | uat | production
---|---|--- | ---
PROJECT_ID | example | example | example
SECRET_KEY | example | example | example

You can find this config at ```your_project/sheets2env.config.json```
```js
{
    dest: 'path/to/.env',
    tab: 'google_sheet_tabname',
    column: 1 // 0 is key column
}
```