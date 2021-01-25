# gitdo
A tool that allows you clone git repository from gitlab or github.

## install

I recommend you use global install for bin command then you can clone your repo in anywhere you want conveniently.

$ npm install gitdo -g

## Pre-work

There are three options you need to know for clone, you can set them in command line interaction:

**GITHUB_ACCESS_TOKEN**:

​	You can create the github token from your github Setting --> Developer settings --> Personal access tokens

​	<img src="https://github.com/shiyubi123/assets/blob/master/img/gitdo/github-token.jpg?raw=true" alt="github-token.jpg" style="zoom: 67%;" />

**GITLAB_ACCESS_TOKEN**:

​	The gitlab personal token,you can create and get it through gitlab --> setting --> Access Tokens

​	<img src="https://github.com/shiyubi123/assets/blob/master/img/gitdo/gitlab-token.png?raw=true" alt="gitlab-token.png" style="zoom:50%;" />

**GITLAB_URL**:

​	The url of the gitlab that you want down repository from.



## Usage

You can use bin :

```bash
gitdo
```

-e --edit: Edit your git config.

-c --clean: Clean your git config.

## other

Cause the clone is through your personal token,so the repo will automatically link to your git.
