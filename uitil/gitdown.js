const chalk = require('chalk')

async function gitData(gitname) {
  const api = await require('../api/git')
  let resData = await api[`${gitname}Repos`]()
  try {
    let res = {}
    res.gitName = gitname
    res.repoNames = handleNames(resData)
    res.repoUrls = handleUrls(resData,gitname)
    return res
  } catch (e) {
    throw `get ${gitname} data failed`
  }
}

function handleNames(resData) { 
  let res = []
  resData.forEach(item => {
    res.push(item.name)
  })
  return res
}

function handleUrls(resData,gitname) {
  let res = []
  if (gitname === 'gitlab') {
    resData.forEach(item => {
      res.push({
        name: item.name,
        ssh_url: item.ssh_url_to_repo,
        http_url: item.http_url_to_repo,
        web_url: item.web_url
      })
    })
  } else {
    resData.forEach(item => {
      res.push({
        name: item.name,
        ssh_url: item.ssh_url,
        http_url: item.clone_url,
        web_url: item.svn_url
      })
    })
  }
  return res
}

module.exports = { gitData }
