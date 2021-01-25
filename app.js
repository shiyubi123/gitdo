const ora = require('ora')
const chalk = require('chalk')
const inquirer = require('inquirer')
const { exec } = require('child_process')
const { getConfig, saveConfig, checkConfigs } = require('./uitil/config')

async function gitclone() {
  try {
    configs = await getConfig()
    const { answers, gitRepos } = await startInquire(configs)
    download(answers, gitRepos)
  } catch(e) {
    console.log('\n', chalk.red('Error: '), e)
  }
}

async function startInquire(configs) {
  const Preprompts = [
    {
      name: 'git',
      type: 'checkbox',
      message: 'Do you want download from github or gitlab:',
      choices: ['github', 'gitlab'],
      validate: (input) => {
        if (input.length < 1) {
          return 'Please choose at least one choice'
        } else {
          return true
        }
      }
    },
    {
      name: 'GITHUB_ACCESS_TOKEN',
      type: 'input',
      message: 'Please input your github token:',
      when: (answers) => {
        return answers.git.indexOf('github') >= 0 && !checkConfigs(configs,['GITHUB_ACCESS_TOKEN'])
      },
      validate: (input) => {
        if (input.length < 1) {
          return 'Please input your github token'
        }
        return true
      }
    },
    {
      name: 'GITLAB_URL',
      type: 'input',
      message: 'Please input your gitlab url:',
      when: (answers) => {
        return answers.git.indexOf('gitlab') >= 0 && !checkConfigs(configs,['GITLAB_URL'])
      }
    },
    {
      name: 'GITLAB_ACCESS_TOKEN',
      type: 'input',
      message: 'Please input your gitlab token:',
      when: (answers) => {
        return answers.git.indexOf('gitlab') >= 0 && !checkConfigs(configs,['GITLAB_ACCESS_TOKEN'])
      },
      validate: async (input) => {
        if (input.length < 1) {
          return 'Please input your gitlab token'
        }
        return true
      }
    }
  ]
  const preAnswers = await inquirer.prompt(Preprompts)
  saveConfig(configs, preAnswers)

  const gitRepos = await getGitData(preAnswers.git)

  if (typeof gitRepos !== 'object') {
    throw('Failed get data from your git configs, please check if your config correct')
  }

  const prompts = [
    {
      name: 'project',
      type: 'checkbox',
      message: 'Please choose the project you want to clone:',
      choices: gitRepos.repoNames,
      validate: (input) => {
        if (input.length < 1) {
          return 'Please choose at least one choice'
        }
        return true
      }
    },
    {
      name: 'path',
      type: 'input',
      message: "Please input filepath:",
      when: (answers) => {
        console.log(answers)
        return !answers.history
      },
      validate: (input) => {
        if (input.length < 1) {
          return "Filepath can't be null"
        }
        return true
      },
      default: './'
    }
  ]
  const answers = await inquirer.prompt(prompts)
  return { answers, gitRepos }
}

function download(answers, gitRepos) {
  const spinner = ora({
    text: chalk.yellow('Repository is downloading...'),
    color: 'yellow'
  }).start()

  answers = handleAnswers(answers)
  answers.project.forEach((pro,idx) => {
    const downloadUrl = gitRepos.repoUrls.filter(url => url.name === pro)
    exec(`git clone ${downloadUrl[0].ssh_url} ${answers.path + pro}`,(error,stdout,stderr) => {
      if (error) {
        spinner.stop()
        console.log(chalk.blue(JSON.stringify(answers)))
        console.log(error)
      } else {
        answers.project[idx] = true
        answers.project.every(pro => pro === true) ? spinner.stop() : true
        console.log(stdout, stderr)
        console.log(chalk.green(`Repository ${pro} download complete!`));
      }
    })
  })
}

function handleAnswers(answers) {
  answers.path[answers.path.length - 1] === '/' ? true : answers.path += '/'
  return answers
}

async function getGitData(options) {
  const spinner = ora({ text: chalk.yellow('Connecting your git'), color: 'yellow' }).start()
  const { gitData } = await require('./uitil/gitdown')
  try {
    const promiseAry = []
    options.forEach(async (gitname) => { promiseAry.push(gitData(gitname)) })
    let gitReopsData = mergeData(await Promise.all(promiseAry))
    return gitReopsData
  } catch (e) {
    console.log('\n', chalk.red('Error: '), e)
  } finally {
    spinner.stop()
  }
}

function mergeData(gitData) {
  let resData = {
    repoNames: [],
    repoUrls: []
  }
  gitData.forEach(item => {
    for (const key in resData) {
      resData[key] = resData[key].concat(new inquirer.Separator(`== ${item.gitName} ==`)).concat(...item[key])
    }
  })
  return resData
}

module.exports = { gitclone }