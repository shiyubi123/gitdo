const fs = require('fs')
const inquirer = require('inquirer')
const path = require('path')
const configPath = path.resolve(__dirname,'./../config.json')

async function getConfig() {
  return new Promise(resolve => {
    fs.readFile(configPath, 'utf8', (err, data) => {
      if(!data) {
        resolve({})
        return
      }
      resolve(JSON.parse(data))
    })
  })
}

function saveConfig(config, preAnswer) {
  const newConfig = mergeOptions(config , preAnswer)
  fs.writeFile(configPath, JSON.stringify(newConfig), 'utf-8', (err) => {
    if (err) {
      console.log('\n', err)
    }
  })
}

async function editConfig(option) {
  if (option === 'clear') {
    const config = mergeOptions({}, {})
    fs.writeFile(configPath, JSON.stringify(config), 'utf-8', (err) => {
      if (err) {
        console.log('\n', err)
      }
      console.log('Clean success!')
    })
    return
  }
  const config = await getConfig()
  if (option) {
    saveConfig(config, option)
  } else {
    let newConfig = {}
    const answer = await editInquirer()
    answer.gitOption.forEach((key) => {
      switch (key) {
        case 'github-token':
          newConfig['GITHUB_ACCESS_TOKEN'] = answer['new-github-token']
        case 'gitlab-url':
          newConfig['GITLAB_URL'] = answer['new-gitlab-url']
        case 'gitlab-token':
          newConfig['GITLAB_ACCESS_TOKEN'] = answer['new-gitlab-token']
      }
    })
    saveConfig(config, newConfig)
  }
}

function clearConfig() {
  editConfig('clear')
}

function mergeOptions(config, preAnswer) {
  let res = {
    GITHUB_URL: '',
    GITHUB_ACCESS_TOKEN: '',
    GITLAB_URL: '',
    GITLAB_ACCESS_TOKEN: ''
  }
  for (key in res) {
    if (Object.prototype.toString.call(config[key]) === '[object Object]') {
      res[key] = mergeOptions(config[key], preAnswer[key] || {})
    } else {
      res[key] = save(config, preAnswer, key)
    }
  }
  res['GITHUB_URL'] = 'https://api.github.com'
  return res
}

function checkConfigs(configs, options) {
  for (let i = 0; i <= options.length - 1; i++) {
    if (!configs[options[i]]) return false
  }
  return true
}

function save(config, preAnswer, key) {
  return preAnswer[key] || config[key] || ''
}

async function editInquirer() {
  const prompts = [
    {
      name: 'gitOption',
      type: 'checkbox',
      message: 'Please choose the config options you want to edit:',
      choices: ['github-token', 'gitlab-url', 'gitlab-token']
    },
    {
      name: 'new-github-token',
      type: 'input',
      message: 'Please input your new github token:',
      when: preAnswer => preAnswer.gitOption.indexOf('github-token') >= 0
    },
    {
      name: 'new-gitlab-url',
      type: 'input',
      message: 'Please input your new gitlab url:',
      when: preAnswer => preAnswer.gitOption.indexOf('gitlab-url') >= 0
    },
    {
      name: 'new-gitlab-token',
      type: 'input',
      message: 'Please input your new gitlab token:',
      when: preAnswer => preAnswer.gitOption.indexOf('gitlab-token') >= 0
    },
  ]
  const answers = await inquirer.prompt(prompts)
  return answers
}

module.exports = { getConfig, saveConfig, checkConfigs, clearConfig, editConfig }