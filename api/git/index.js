const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const axios = require('axios');
const configPath = path.resolve(__dirname,'./../../config.json')

const getConfig = new Promise(resolve => {
  fs.readFile(configPath,'utf8',(err,data) => { 
    resolve(JSON.parse(data))
  })
})


class Request {
  constructor(configs) {
  let errorShow = false
  this.service = axios.create(configs)
    this.service.interceptors.request.use(
      config => {
        return config
      },
      err => {
      }
    )
    this.service.interceptors.response.use(
      res => {
        return res.data
      },
      err => {
        if(!errorShow) {
          errorShow = true
          errHandle(err)
        }
      }
    )
  }
}

function errHandle(err) {
  try {
    if (!err.response) {
      throw 'You may set the wrong url'
    }
    if (err.response.status === 401) {
      console.log('\n',chalk.red('ResponseError: '),`GitToken verify failed`)
    }
    if (err.response.status === 404) {
      console.log('\n',chalk.red('ResponseError: '),`Your gitUrl may be wrong`)
    }
  } catch (e) {
    console.log(chalk.red('Error:'),'You may set the wrong url')
  }
}

async function setConfig() {
  const { GITLAB_ACCESS_TOKEN, GITHUB_ACCESS_TOKEN, GITHUB_URL, GITLAB_URL } = await getConfig
  const hubconfig = {
    baseURL: GITHUB_URL,
    headers: {'Authorization': 'token ' + GITHUB_ACCESS_TOKEN }
  }
  const labconfig = {
    baseURL: GITLAB_URL + '/api/v3/',
    headers: {'PRIVATE-TOKEN': GITLAB_ACCESS_TOKEN }
  }
  const hubRequst = new Request(hubconfig, 'github').service
  const labRequest = new Request(labconfig, 'gitlab').service

  return {
    githubRepos() {
      return hubRequst.get('/user/repos')
    },
    gitlabRepos() {
      return labRequest.get('projects')
    }
  }
}
module.exports = setConfig()