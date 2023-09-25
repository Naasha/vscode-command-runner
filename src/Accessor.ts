/**
 *****************************************
 * Created by edonet@163.com
 * Created on 2020-08-16 10:34:32
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import * as vscode from 'vscode';
import variable from './helpers/variable';
import * as fs from 'fs';


/**
 *****************************************
 * 变量名
 *****************************************
 */
export const variableMap = {
    file: 1,
    fileBasename: 1,
    fileBasenameNoExtension: 1,
    fileDirname: 1,
    fileExtname: 1,
    lineNumber: 1,
    lineNumbers: 1,
    columnNumber: 1,
    columnNumbers: 1,
    selectedText: 1,
    selectedTextList: 1,
    selectedTextSection: 1,
    selectedPosition: 1,
    selectedPositionList: 1,
    selectedLocation: 1,
    selectedLocationList: 1,
    relativeFile: 1,
    relativeFileNoExtension: 1,
    relativeFileDirname: 1,
    workspaceFolder: 1,
    workspaceFolderBasename: 1,
    homedir: 1,
    tmpdir: 1,
    platform: 1,
};


/**
 *****************************************
 * 变量类型
 *****************************************
 */
export type VariableScope = keyof typeof variableMap;


/**
 *****************************************
 * 存取器
 *****************************************
 */
export default class Accessor {

    private _customCommands: Record<string, string>;

    public constructor() {

        this._customCommands = this.loadCustomCommands(); // Charge les commandes personnalisées lors de l'initialisation
    }

    /**
    * Charge les commandes personnalisées depuis le fichier spécifié dans la configuration.
    */
    private loadCustomCommands(): Record<string, string> {
        const settings = vscode.workspace.getConfiguration('command-runner') as unknown as CommandRunnerSettings;
        const customCommandsFile = settings.customCommandsFile;
        try {
            const fileContent = fs.readFileSync(customCommandsFile, 'utf-8');
            return JSON.parse(fileContent);
        } catch (error) {
            console.error('Error loading custom commands:', error);
            return {};
        }
    }

    /* 变量缓存对象 */
    private $variable = variable();

    /* 获取环境变量 */
    env(scope: string): string {
        return this.$variable.env()[scope.toUpperCase()] || '';
    }

    /* 获取配置 */
    config<T = unknown>(scope: string): T | undefined {
        return this.$variable.config().get(scope);
    }

    /* 获取包配置 */
    package<T = unknown>(scope: string): T | undefined {
        return this.$variable.package()[scope] as T;
    }

    /* 获取变量 */
    variable(scope: VariableScope): string {
        return variableMap[scope] === 1 ? this.$variable[scope]() : '';
    }

    /* 获取命令 */
    command(name: string): string {
        return this.$variable.commands()[name] || name;
    }

    /* 获取命令集 */
    commands(): Record<string, string> {
        const customCommands = this.customCommands(); // Obtenez vos commandes personnalisées
        const defaultCommands = this.$variable.commands(); // Obtenez les autres commandes
    
        /* Fusionnez les deux en un seul objet */
        return { ...customCommands, ...defaultCommands };
    }
    

    customCommands(): Record<string, string> {
        return this._customCommands;
    }

    /* 获取输入 */
    input(value: string): Thenable<string | undefined> {
        return vscode.window.showInputBox({ placeHolder: value && `default: "${value}"` });
    }
}
