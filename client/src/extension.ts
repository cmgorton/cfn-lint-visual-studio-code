/*
Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License").
You may not use this file except in compliance with the License.
A copy of the License is located at

    http://www.apache.org/licenses/LICENSE-2.0

or in the "license" file accompanying this file. This file is distributed
on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied. See the License for the specific language governing
permissions and limitations under the License.
*/
'use strict';

import * as path from 'path';

import { workspace, ExtensionContext, ConfigurationTarget } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient';

export function activate(context: ExtensionContext) {

	// The server is implemented in node
	let serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
	// The debug options for the server
	let debugOptions = { execArgv: ["--nolazy", "--inspect=6010"] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
	};

	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [
			{ scheme: 'file', language: 'yaml' },
			{ scheme: 'file', language: 'json' }
		],
		synchronize: {
			// Synchronize the setting section 'languageServerExample' to the server
			configurationSection: 'cfnLint',
			// Notify the server about file changes to '.clientrc files contain in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	workspace.getConfiguration().update('yaml.format.enable', true, ConfigurationTarget.Global);
	workspace.getConfiguration().update('yaml.trace.server', 'verbose', ConfigurationTarget.Global);
	workspace.getConfiguration().update('yaml.validate', false, ConfigurationTarget.Global);
	workspace.getConfiguration().update('yaml.customTags', [
		'!And',
		'!If',
		'!Not',
		'!Equals',
		'!Or',
		'!FindInMap',
		'!Base64',
		'!Cidr',
		'!Ref',
		'!Sub',
		'!GetAtt',
		'!GetAZs',
		'!ImportValue',
		'!Select',
		'!Split',
		'!Join'
	], ConfigurationTarget.Global);
	workspace.getConfiguration().update('[yaml]', {
		"editor.insertSpaces": true,
		"editor.tabSize": 2,
		"editor.quickSuggestions": {
			"other": true,
			"comments": false,
			"strings": true
		},
		"editor.autoIndent": true
	}, ConfigurationTarget.Global);
	workspace.getConfiguration().update('yaml.schemas', {
		"https://s3.amazonaws.com/cfn-resource-specifications-us-east-1-prod/schemas/2.15.0/all-spec.json": "*.yaml"
	}, ConfigurationTarget.Global);
	workspace.getConfiguration().update('json.schemas', [
		{
			'fileMatch': [
				'*-template.json'
			],
			'url': 'https://s3.amazonaws.com/cfn-resource-specifications-us-east-1-prod/schemas/2.15.0/all-spec.json'
		}
	], ConfigurationTarget.Global)
	// Create the language client and start the client.
	let disposable = new LanguageClient('cfnLint', 'CloudFormation linter Language Server', serverOptions, clientOptions).start();

	// Push the disposable to the context's subscriptions so that the
	// client can be deactivated on extension deactivation
	context.subscriptions.push(disposable);
}
