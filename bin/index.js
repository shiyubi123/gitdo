#!/usr/bin/env node
const { Command } = require('commander')
const { gitclone } = require('../app')
const { editConfig, clearConfig } = require('./../uitil/config')
const program = new Command()
program
  .option('-e --edit')
  .option('-c --clear')
  .parse(process.argv)

async function gitconfig() {
  if (program.edit) {
    await editConfig()
    return
  }
  if (program.clear) {
    await clearConfig()
    return
  }
  await gitclone()
}
gitconfig()