#!/usr/bin/env node

import inquirer from "inquirer";
import * as fs from 'fs'
import { dirname } from "path";
import { fileURLToPath } from "url";
import { render } from "./utils/template.js";

const CURR_DIR = process.cwd()
const __dirname = dirname(fileURLToPath(import.meta.url))

const CHOICES = fs.readdirSync(`${__dirname}/templates`)



const QUESTIONS = [
    {
        name: 'project-choice',
        type: 'list',
        message: 'What project template would you like to generate ?',
        choices: CHOICES
    },
    {
        name: 'project-name',
        type: 'input',
        message: 'Project name: ',
        validate: function (input) {
            if(/^([A-Za-z\-\\_\d])+$/.test(input)) return true;
            else return "Project name may only contain letters, numbers, underscores and hashes."
        }
    }
]

inquirer.prompt(QUESTIONS).then(answer => {
    const projectChoice = answer['project-choice']
    const projectName = answer['project-name']
    const templatePath = `${__dirname}/templates/${projectChoice}`

    fs.mkdirSync(`${CURR_DIR}/${projectName}`)

    createDirectoryContents(projectName, templatePath, projectName)
})

const createDirectoryContents = (projectName, templatePath, newProjectPath) => {
    const filesToCreate = fs.readdirSync(templatePath)

    filesToCreate.forEach(file => {
        const origFilePath = `${templatePath}/${file}`

        const stats = fs.statSync(origFilePath)

        if(stats.isFile()) {
            let contents = fs.readFileSync(origFilePath, 'utf-8')
            contents = render(contents, { projectName });
            if(file === '.npmignore') file = '.gitignore'

            const writePath = `${CURR_DIR}/${newProjectPath}/${file}`
            fs.writeFileSync(writePath, contents, 'utf-8')
        } else if (stats.isDirectory()) {
            fs.mkdirSync(`${CURR_DIR}/${newProjectPath}/${file}`)

            createDirectoryContents(
                projectName,
                `${templatePath}/${file}`,
                `${newProjectPath}/${file}`
            )
        }
    })
}