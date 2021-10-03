#!/usr/bin/env node
/* eslint-env node */

/*!
 * Script to run custom unit scss tests.
 *
 * At the time this script was created, dart-sass js api didn't support 'quiet' option,
 * and on every failing assertion, the script was breaking
 *
 * In addition, the usage of karma/jasmine runner was not possible,
 * as it needed much configuration
 * and at least in windows 10, was having conflict with the fsevents module
 *
 * Two available options when we ar using this script
 *  * -v  => makes output verbose.
 *          In opposite case it just informs when it is done, and only if the execution has assertion errors
 */

'use strict'

let hasFailedAssertions = false
let errors = []
const process = require('node:process')
const BE_VERBOSE = process.argv.includes('-v')

const path = require('path')
const glob = require('glob')
const helpers = require('./helpers')
const sassTrue = require('sass-true')

const rootDir = 'test-scss'

const describeModule = function (module) {
  helpers.printModule(module.module)
  for (const submodule of module.modules || []) {
    describeModule(submodule)
  }

  for (const test of module.tests || []) {
    let countFailed = 0
    helpers.printTest(test.test)
    for (const assertion of test.assertions || []) {
      if (!assertion.passed) {
        hasFailedAssertions = true
        countFailed++
        const assertionDetails = sassTrue.formatFailureMessage(assertion)
        errors.push(new helpers.ErrorAssertion(module.module, test.test, assertionDetails))
        helpers.printTestDetails(assertionDetails)
      }
    }

    helpers.print(`Assertions: ${test.assertions.length}  -  Failed: ${countFailed}\n`, 8, helpers.colors.Magenta)
    countFailed = 0
  }
}

async function run() {
  const files = glob.sync(path.resolve(__dirname, 'tests/**/*.scss'))
  for (const file of files) {
    errors = []
    const relative = file.slice(Math.max(0, file.indexOf(rootDir)))
    helpers.print(`Processing ${relative}`, 0, helpers.colors.Blue, true)
    // eslint-disable-next-line no-await-in-loop
    const result = await helpers.execSassPromise(relative)

    if (result.status === 'rejected') {
      process.exit(1)
    }

    const modules = sassTrue.parse(result)
    for (const module of modules) {
      describeModule(module)
    }

    if (!BE_VERBOSE) {
      for (const error of errors) {
        helpers.printModule(error.module, true)
        helpers.printTest(error.test, true)
        helpers.printTestDetails(error.assertionDetails, true)
      }
    }
  }

  helpers.print('End scss tests', 0, helpers.colors.Green, true)
  process.exit(hasFailedAssertions ? 1 : 0)
}

helpers.print('Start scss tests... \n', 0, helpers.colors.Green, true)
run() // begin execution
