## Installation

#### With [npm](https://npmjs.com)

```
npm install --save-dev env-from-sheet
```
## Usage
```js
import { SheetEnv } from 'env-from-sheet'

const client = new SheetEnv({
    installed:
    {
        client_id: 'your_client_id',
        client_secret: 'your_secret',
        redirect_uris: ['http://localhost']
    }
}, {
    projects: [
        {
            dest: 'path/to/.env',
            tab: 'google_sheet_tabname',
            column: 1 // 0 is key column
        }
    ],
    sheetId: 'your_sheet_id',
}, your_google_token)
```

Note that if you don't have 
```google_token``` just leave it blank, terminal will ask you for authorization after you run sync()

```js
await client.sync()
```

## Example of token file

```js
// This file is auto generated after sync()
// Please .gitignore for your security
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

```js
{
    dest: 'path/to/.env',
    tab: 'google_sheet_tabname',
    column: 1 // 0 is key column
}
```