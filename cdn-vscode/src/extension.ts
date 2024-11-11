import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'cdn.copyAsVscodeLink',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage('No active editor found.');
        return;
      }

      const selection = editor.selection;
      const fileUri = editor.document.uri.fsPath;
      const startLine = selection.start.line;
      const startCharacter = selection.start.character;
      const endLine = selection.end.line;
      const endCharacter = selection.end.character;

      const payload = {
        filePath: fileUri,
        startLine,
        startCharacter,
        endLine,
        endCharacter,
      };

      const searchParams = new URLSearchParams();

      searchParams.set('payload', JSON.stringify(payload));

      const vscodeLink = `${
        vscode.env.uriScheme
      }://yasintz.cdn?${searchParams.toString()}`;

      await vscode.env.clipboard.writeText(vscodeLink);
      vscode.window.showInformationMessage('VS Code link copied to clipboard.');
    }
  );

  context.subscriptions.push(disposable);

  const uriHandler = vscode.window.registerUriHandler({
    handleUri(uri: vscode.Uri) {
      const query = uri.query;
      const params = new URLSearchParams(query);

      const payload = params.get('payload');
      if (!payload) {
        return;
      }

      const { filePath, startLine, startCharacter, endLine, endCharacter } =
        JSON.parse(payload);

      if (filePath) {
        vscode.workspace.openTextDocument(filePath).then((doc) => {
          vscode.window.showTextDocument(doc).then((editor) => {
            const start = new vscode.Position(startLine, startCharacter);
            const end = new vscode.Position(endLine, endCharacter);
            editor.selection = new vscode.Selection(start, end);
            editor.revealRange(new vscode.Range(start, end));
          });
        });
      }
    },
  });

  context.subscriptions.push(uriHandler);
}
