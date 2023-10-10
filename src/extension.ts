// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "COP" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('Cop.assistance', async () => {
		vscode.window.showInputBox({ prompt: "COP: Enter your instruction" }).then(async function (value) {
			let completionResponse: any;
			let filePath: any;
			let fetchAssistanceFlag: boolean = false;

			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "COP",
				cancellable: false
			}, async (progress, token) => {

				// Report progress to the progress bar
				progress.report({ increment: 20, message: 'Fetching the best assistance' });

				try {
					// Fetch the response from server
					completionResponse = await getCompletion(value);
	
					// Report progress to the progress bar
					progress.report({ increment: 50, message: 'Fetching the best assistance' });
	
					// Write the API response to a temporary file location
					filePath = await writeTempFile(completionResponse);
					fetchAssistanceFlag = true;
				} catch (err) {
					console.error(err);

					// Report progress to the progress bar
					progress.report({ increment: 30, message: 'Assistance failed' });	
				}
		
				// Report progress to the progress bar
				progress.report({ increment: 30, message: 'Assistance complete' });
			});

			if (!fetchAssistanceFlag) {
				const statusBarMessage = vscode.window.setStatusBarMessage('COP: Assistance Failed!');
				// Dispose of the status bar message after 2 seconds
				setTimeout(() => {
					statusBarMessage.dispose();
				}, 4000);
			} else {
				// Open the file as a TextDocument
				vscode.workspace.openTextDocument(filePath).then((document) => {
	
					// Show the TextDocument in a split editor
					vscode.window.showTextDocument(document, { viewColumn: vscode.ViewColumn.Two, preserveFocus: false });
	
					const statusBarMessage = vscode.window.setStatusBarMessage('COP: Assistance complete!');
					// Dispose of the status bar message after 2 seconds
					setTimeout(() => {
						statusBarMessage.dispose();
					}, 4000);
				});
			}

		});
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
	apiKey: "DUMMY"
});

const openai = new OpenAIApi(configuration);
const model = 'text-davinci-003';

const getCompletion = async (prompt: any) => {
	// const models = await openai.listModels(); 
	const completion = await openai.createCompletion({
		model: model,
		prompt: prompt,
		max_tokens: 3000
	});

	return completion.data.choices[0].text;
}

const fs = require('fs');
const os = require('os');
const path = require('path');

async function writeTempFile(content: string) {
	// Get a temporary file path
	const tempFilePath = path.join(os.tmpdir(), 'cop-assistance.txt');

	// Remove the file if already exists

	if (await fs.existsSync(tempFilePath)) {
		fs.unlinkSync(tempFilePath);
	}

	// Write content to the temporary file
	await fs.writeFileSync(tempFilePath, content);

	// Return the path of the temporary file
	return tempFilePath;
}
