import * as vscode from "vscode";
import { pullFromCodeSandbox } from "./fetch";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "codesandbox-pull.pullFromCodeSandbox",
    async () => {
      const searchQuery = await vscode.window.showInputBox({
        placeHolder: "Pull with sandbox id",
        prompt: "Like as svg-maps-with-html-annotations-mkq8e",
        value: "svg-maps-with-html-annotations-mkq8e",
      });

      if (searchQuery === "") {
        return vscode.window.showErrorMessage(
          "It is empty. Fill with sandbox id."
        );
      } else if (!vscode.workspace.workspaceFolders) {
        return vscode.window.showInformationMessage(
          "No folder or workspace opened. Open a workspace or folder."
        );
      } else {
        pullFromCodeSandbox(searchQuery!).then(async (res) => {
          let directoryObject: any = {};
          const sandBoxName = res.data.data.alias;

          const workspacePath =
            (vscode.workspace.workspaceFolders &&
              vscode.workspace.workspaceFolders[0].uri);

          // create main folder of sandbox
          vscode.workspace.fs.createDirectory(
            vscode.Uri.parse(workspacePath + "/" + sandBoxName)
          );

          for (const directory of res.data.data.directories) {
            directoryObject[directory.shortid] = directory.title;

            // create folders of sandbox
            await vscode.workspace.fs.createDirectory(
              vscode.Uri.parse(
                workspacePath + "/" + sandBoxName + "/" + directory.title
              )
            );
          }

          for (const module of res.data.data.modules) {
            const writeData = Buffer.from(module.code, "utf8");

            // create files of sandbox
            await vscode.workspace.fs.writeFile(
              vscode.Uri.parse(
                workspacePath +
                  "/" +
                  sandBoxName +
                  "/" +
                  (directoryObject[module.directory_shortid] ?? "") +
                  "/" +
                  module.title
              ),
              writeData
            );
          }
        });
      }
    }
  );

  context.subscriptions.push(disposable);
}
