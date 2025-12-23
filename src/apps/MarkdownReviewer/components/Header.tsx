import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface HeaderProps {
  fileMode: 'upload' | 'watch' | 'folder';
  setFileMode: (mode: 'upload' | 'watch' | 'folder') => void;
  isFolderMode: boolean;
  isWatching: boolean;
  folderName: string;
  markdownContent: string | null;
  currentFileName: string | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectFolder: () => void;
  handleSelectFileForWatch: () => void;
  stopWatching: () => void;
  handleCloseFolder: () => void;
}

export function Header({
  fileMode,
  setFileMode,
  isFolderMode,
  isWatching,
  folderName,
  markdownContent,
  currentFileName,
  handleFileUpload,
  handleSelectFolder,
  handleSelectFileForWatch,
  stopWatching,
  handleCloseFolder,
}: HeaderProps) {
  return (
    <div className="bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Markdown Reviewer</h1>
      <div className="flex justify-between items-center gap-8 flex-wrap">
        <div className="flex gap-4 items-center">
          <Label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            <input
              type="radio"
              name="fileMode"
              value="upload"
              checked={fileMode === 'upload'}
              onChange={(e) => setFileMode(e.target.value as 'upload' | 'watch' | 'folder')}
              className="cursor-pointer"
            />
            <span className={fileMode === 'upload' ? 'text-blue-600 font-medium' : ''}>Upload File</span>
          </Label>
          <Label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            <input
              type="radio"
              name="fileMode"
              value="watch"
              checked={fileMode === 'watch'}
              onChange={(e) => setFileMode(e.target.value as 'upload' | 'watch' | 'folder')}
              className="cursor-pointer"
            />
            <span className={fileMode === 'watch' ? 'text-blue-600 font-medium' : ''}>Watch File</span>
          </Label>
          <Label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            <input
              type="radio"
              name="fileMode"
              value="folder"
              checked={fileMode === 'folder'}
              onChange={(e) => setFileMode(e.target.value as 'upload' | 'watch' | 'folder')}
              className="cursor-pointer"
            />
            <span className={fileMode === 'folder' ? 'text-blue-600 font-medium' : ''}>Open Folder</span>
          </Label>
        </div>
        <div className="flex gap-4 items-center flex-wrap">
          {fileMode === 'upload' ? (
            <Label className="inline-block">
              <input
                type="file"
                accept=".md"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button asChild>
                <span className="cursor-pointer">Upload Markdown File</span>
              </Button>
            </Label>
          ) : fileMode === 'folder' ? (
            <div className="flex gap-4 items-center">
              {!isFolderMode ? (
                <Button onClick={handleSelectFolder} variant="default" className="bg-green-600 hover:bg-green-700">
                  Select Folder
                </Button>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-green-600 font-medium flex items-center gap-2">
                    📁 {folderName}
                  </span>
                  <Button
                    onClick={handleSelectFolder}
                    variant="secondary"
                    size="sm"
                    title="Change folder"
                  >
                    📁 Change
                  </Button>
                  <Button
                    onClick={handleCloseFolder}
                    variant="destructive"
                    size="sm"
                  >
                    Close Folder
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-4 items-center">
              {!isWatching ? (
                <Button onClick={handleSelectFileForWatch} variant="default" className="bg-green-600 hover:bg-green-700">
                  Select File to Watch
                </Button>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-green-600 font-medium flex items-center gap-2">
                    🔄 Watching {markdownContent ? currentFileName : 'file'}...
                  </span>
                  <Button
                    onClick={handleSelectFileForWatch}
                    variant="secondary"
                    size="sm"
                    title="Change file"
                  >
                    📁
                  </Button>
                  <Button
                    onClick={stopWatching}
                    variant="destructive"
                    size="sm"
                  >
                    Stop Watching
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

