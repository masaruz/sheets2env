#!/usr/bin/env node

import { INIT, SYNC } from './constant'
import { init } from './init'
import { sync } from './sync'

const args = process.argv.slice(2)

switch (args[0]) {
    case INIT:
        init()
        break
    case SYNC:
        sync()
        break
}
