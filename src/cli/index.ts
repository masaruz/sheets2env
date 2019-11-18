#!/usr/bin/env node

import { isEmpty } from 'lodash'
import { config, configCI } from './config'
import { getArgument } from './service'

const base64Creds: string = getArgument({
    flag: '-c',
    name: 'credentials',
})

const base64Token: string = getArgument({
    flag: '-t',
    name: 'token',
})
const configPath: string = getArgument({
    flag: '-p',
    name: 'configPath',
})

if (!isEmpty(base64Creds) &&
    !isEmpty(base64Token) &&
    !isEmpty(configPath)) {

    configCI({
        base64Creds,
        base64Token,
        configPath,
    })
} else {
    config()
}

