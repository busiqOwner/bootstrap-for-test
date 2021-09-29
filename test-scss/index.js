/* eslint-env node */

'use strict'

const path = require('path')
const helpers = require('./helpers')
const sassTrue = require('sass-true')
const fs = require('fs')
const { exec } = require('child_process')
const process = require('node:process')
let exitStatus = 0
const BE_VERBOSE = process.argv.includes('-v')
const DELETE_OUTPUT_FILE = process.argv.includes('-r')
const errors = []
const sassScript = 'sass --style expanded --quiet --no-source-map --no-error-css test-scss/index.spec.scss:test-scss/index.css'
const sassFile = path.join(__dirname, 'index.css')

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

exec(sassScript, (error, stdout, stderr) => {
  if (error) {
    helpers.print(`error: ${error.message}`)
    process.exit(1)
  }

  const modules = sassTrue.parse(fs.readFileSync(sassFile).toString())

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

  if (DELETE_OUTPUT_FILE) {
    fs.unlinkSync(sassFile)
  }

  process.exit(exitStatus)
})
