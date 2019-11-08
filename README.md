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
            tab: 'tabname',
            column: number
        }
    ],
    sheetId: 'your_sheet_id',
}, your_google_token_path)
```

Note that if you don't have 
```google_token_path``` just leave it blank, cli will ask you for authorization after you run sync()

```js
await client.sync()
```

#### Google Sheet Structure
##### From this table we decalre column ```develop``` as ```{column:1}``` and ```uat``` as ```{column:2}``` and ```production``` as ```{column:3}```

key | develop | uat | production
---|---|--- | ---
PROJECT_ID | example | example | example
SECRET_KEY | example | example | example

```js
{
    dest: 'path/to/.env',
    tab: 'tabname',
    column: number <<< here
}
```