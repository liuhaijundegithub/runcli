#!/usr/bin/env node

const { program } = require('commander')
const figlet = require('figlet')
const inquirer = require('inquirer')

const fs = require('fs-extra')
const path = require('path')
const gitClone = require('git-clone');
const ora = require('ora');
// 首航提示
program.name('runcli').usage('<command> [options]')

// 版本
program.version(`${require('../package.json')['version']}`)

// 命令
program
  .command('create <app-name>')
  .description('create a new project')
  .action(projectName => {
    createProject(projectName)
  })

// program.on('--help', function () {
//   console.log('')
// });

program.parse(process.argv);

function log (obj) {
  console.log(JSON.stringify(obj))
} 

const projectList = {
  'react': '',
  'react-ts': 'https://gitee.com/unisolution_cn_lhj/reactdemo.git'
}

async function createProject (projectName) {
  // 创建一个名字为projectName的文件夹，将模板代码放在文件夹下面
  // 判断有没有 name 的文件夹
  const currentFolder = process.cwd();
  const fullPath = path.join(currentFolder, projectName);
  const isExist = fs.existsSync(fullPath)

  if (isExist) {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overWrite',
        message: `${projectName}已经存在，是否要覆盖？`
      }
    ])
    const { overWrite } = answers;
    if (overWrite) {
      fs.remove(fullPath)
      generateNewProject(fullPath)
    } else return;
  } else {
    generateNewProject(fullPath)
  }
}

async function generateNewProject (projectPath) {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: `请选择模板`,
      choices: [
        {
          name: 'react',
          value: 'react'
        },
        {
          name: 'react-ts',
          value: 'react-ts'
        }
      ]
    }
  ])
  const { type } = answers;
  if (type === 'react-ts') {
    const address = projectList[type];
    // 拿到仓库的地址？
    const loading = ora('正在生成模板...').start();
    gitClone(address, projectPath, {
      checkout: 'master'
    }, function (err) {
      if (err) {
        loading.fail('生成失败，请检查网络问题重试')
      } else {
        loading.succeed('创建完毕')
      }
    })
  }
  if (type === 'react') {
    console.log('不选ts你是怎么想的');
    console.log('重新创建去吧');
  }
}