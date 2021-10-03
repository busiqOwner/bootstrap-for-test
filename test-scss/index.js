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

let exitStatus = 0
const errors = []
const process = require('node:process')
const BE_VERBOSE = process.argv.includes('-v')

const fs = require('fs')
const helpers = require('./helpers')
const sassTrue = require('sass-true')
const { exec } = require('child_process')

const rootDir = 'test-scss'
const outputFile = rootDir + '/index.css'
const sassScript = `sass --style expanded --quiet --no-source-map --no-error-css ${rootDir}/index.spec.scss:${outputFile}`

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
        exitStatus = 1
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

helpers.print('Start scss tests... \n', 0, helpers.colors.Green, true)
// eslint-disable-next-line no-unused-vars
exec(sassScript, (error, stdout, stderr) => {

  if (error) {
    helpers.print(`error: ${error.message}`)
    process.exit(1)
  }

  const cssFile = fs.readFileSync(outputFile).toString()
  const modules = sassTrue.parse(cssFile)

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

  fs.unlinkSync(outputFile)
  helpers.print('End scss tests', 0, helpers.colors.Green, true)
  process.exit(exitStatus)
})

