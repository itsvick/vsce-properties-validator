import * as vscode from 'vscode';
const fs = require("fs");
const propertiesToJSON = require("properties-to-json");
import * as _ from 'lodash';
export const validateProperties = () => {

  const visibleTextEditor = vscode.window.visibleTextEditors;
  const workSpaceEdit = new vscode.WorkspaceEdit();
  const document = visibleTextEditor[0].document;
  const fsPath = document.uri.fsPath;

  const isPropertiesFile = fsPath.split('.').pop() === 'properties';

  if (isPropertiesFile) {
    let propertyJson;
    fs.readFile(fsPath, { encoding: "utf-8" }, (err: any, data: any) => {
      if (!err) {
        console.log(propertiesToJSON(data));
        propertyJson = propertiesToJSON(data);
        propertyJson = formatFile(propertyJson);
        writeFile(propertyJson);
      } else {
        vscode.window.showErrorMessage('Unexpected error occurred while reading file');
      }
    });

    function writeFile(properties: any) {
      const start = new vscode.Position(0, 0);
      const end = new vscode.Position(document.lineCount, 0);
      const docRange = new vscode.Range(start, end);
      workSpaceEdit.delete(visibleTextEditor[0].document.uri, docRange);
      vscode.workspace.applyEdit(workSpaceEdit).then(() => {
        vscode.window.showInformationMessage('Edited!!!!!!!!!');
        let index = 0;
        _.forIn(properties, (value, key) => {
          const position = new vscode.Position(index, 0);
          const lineText = `${key} = ${value}\n`;
          workSpaceEdit.insert(visibleTextEditor[0].document.uri, position, lineText);
          index++;
        });

        vscode.workspace.applyEdit(workSpaceEdit).then(() => { vscode.window.showInformationMessage('Validated Successfully!'); });
      });
    }
    function formatFile(propertyObj: any) {
      let formattedText: any = {};
      _.forIn(propertyObj, (value, key) => {
        key = formatKey(key);
        value = formatValue(value);
        formattedText[key] = value;
      });
      return formattedText;
    }

    function formatKey(key: string): string {
      key = key.replace(/\\\s/g, '');
      return key;
    }

    function formatValue(value: string): string {
      value = value.split("''").join("'");
      value = value.replace(/(\r\n|\n|\r|\\n)/gm, '');
      return value;
    }
  } else {
    vscode.window.showErrorMessage('Not a properties file');
  }
};
