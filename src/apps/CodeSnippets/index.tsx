import { FileSystemItem, useStore } from './store';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderPlusIcon,
  FilePlusIcon,
  TrashIcon,
  DownloadIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import CodeEditor from '@uiw/react-textarea-code-editor';

type FileSystemItemWithChildren = FileSystemItem & {
  children?: FileSystemItemWithChildren[];
};

const FileExplorer: React.FC<{
  items: FileSystemItemWithChildren[];
  onSelectFile: (id: string) => void;
  selectedFileId?: string;
}> = ({ items, onSelectFile, selectedFileId }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  const { items: files, createItem: createFile, updateItem } = useStore();
  const selectedFile = files.find((file) => file.id === selectedFileId);

  const toggleFolder = (name: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  const deleteItem = (id: string) => {
    updateItem(id, { deletedAt: new Date().toISOString() });
  };

  const downloadFile = (id: string) => {
    const file = files.find((file) => file.id === id);
    if (!file) return;
    const blob = new Blob([file.content || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
  };

  const renderItem = (item: FileSystemItemWithChildren, depth: number) => {
    const isExpanded = expandedFolders.has(item.name);

    if (item.type === 'folder') {
      return (
        <div key={item.id} style={{ marginLeft: `${depth * 16}px` }}>
          <div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectFile(item.id);
                toggleFolder(item.name);
              }}
              className={cn(
                'flex items-center space-x-1 text-sm hover:bg-gray-100 rounded px-2 py-1 w-full text-left cursor-pointer',
                selectedFileId === item.id && 'bg-gray-100',
                item.id === 'trash' && 'text-red-500'
              )}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              {item.id === 'trash' ? (
                <TrashIcon className="w-4 h-4" />
              ) : (
                <Folder className="w-4 h-4" />
              )}
              <input
                className="bg-transparent cursor-pointer"
                value={item.name}
                onChange={(e) => updateItem(item.id, { name: e.target.value })}
              />
            </button>
            {isExpanded &&
              item.children?.map((child) => renderItem(child, depth + 1))}
          </div>
        </div>
      );
    }

    return (
      <div key={item.id} style={{ marginLeft: `${depth * 16}px` }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectFile(item.id);
          }}
          className={cn(
            'flex items-center space-x-1 text-sm hover:bg-gray-100 rounded px-2 py-1 w-full text-left',
            selectedFileId === item.id && 'bg-gray-100'
          )}
        >
          <File className="w-4 h-4" />
          <input
            value={item.name}
            className="bg-transparent outline-none cursor-pointer"
            onChange={(e) => updateItem(item.id, { name: e.target.value })}
          />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-5 border-b bg-gray-50 flex gap-2 justify-end px-2 items-center">
        <FolderPlusIcon
          className="w-4 h-4 cursor-pointer"
          onClick={() => {
            const folderId = createFile({
              name: 'New Folder',
              parentId: selectedFile?.parentId,
              type: 'folder',
            });
            setExpandedFolders((prev) => new Set([...prev, folderId]));
          }}
        />
        <FilePlusIcon
          className="w-4 h-4 cursor-pointer"
          onClick={() => {
            createFile({
              name: 'New File',
              parentId: selectedFile?.parentId,
              content: '',
              type: 'file',
            });
          }}
        />
        <TrashIcon
          className={cn(
            'w-4 h-4 cursor-pointer text-red-500',
            !selectedFile &&
              'text-gray-300 cursor-not-allowed pointer-events-none'
          )}
          onClick={() => selectedFile && deleteItem(selectedFile.id)}
        />

        <DownloadIcon
          className={cn(
            'w-4 h-4 cursor-pointer',
            !selectedFile &&
              'text-gray-300 cursor-not-allowed pointer-events-none'
          )}
          onClick={() => selectedFile && downloadFile(selectedFile?.id)}
        />
      </div>
      <div className="p-2 flex-1" onClick={() => onSelectFile('')}>
        {items.map((item) => renderItem(item, 0))}
      </div>
    </div>
  );
};

const FileRenderer = ({ file }: { file: FileSystemItem }) => {
  const { updateItem: updateFile } = useStore();

  if (file.name.endsWith('exc')) {
    return (
      <iframe
        className="w-full h-full border rounded font-mono text-sm"
        src={`https://excalidraw.com/?file_id=${file.id}${file.content}`}
      />
    );
  }

  if (file.name.endsWith('.js')) {
    return (
      <div className="flex-1 min-h-full border rounded overflow-x-scroll">
        <CodeEditor
          className="min-h-full"
          value={file.content || ''}
          language="js"
          placeholder="Please enter JS code."
          onChange={(evn) => updateFile(file.id, { content: evn.target.value })}
          padding={15}
          style={{
            backgroundColor: '#161b22',
            fontFamily:
              'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
          }}
        />
      </div>
    );
  }

  return (
    <textarea
      value={file.content}
      onChange={(e) => updateFile(file.id, { content: e.target.value })}
      className="w-full h-full border rounded p-2 font-mono text-sm"
      placeholder="Select a file to view its content"
    />
  );
};

export default function SimpleCodeEditor({
  initialFileSystem,
}: {
  initialFileSystem: FileSystemItemWithChildren[];
}) {
  const [selectedItemId, setSelectedItemId] = useState('');
  const { items: files } = useStore();

  const selectedFile = files.find((file) => file.id === selectedItemId);

  return (
    <div className="flex h-screen bg-white">
      <div className="w-64 border-r overflow-auto">
        <FileExplorer
          items={initialFileSystem}
          onSelectFile={setSelectedItemId}
          selectedFileId={selectedItemId}
        />
      </div>
      {selectedFile && <FileRenderer file={selectedFile} />}
    </div>
  );
}

function buildNestedFileSystem(
  items: FileSystemItem[],
  parent: FileSystemItemWithChildren
): FileSystemItemWithChildren {
  const copy = { ...parent };
  if (parent.type === 'folder') {
    const childFolders = items.filter(
      (folder) => folder.parentId === parent.id
    );
    copy.children = childFolders.map((folder) =>
      buildNestedFileSystem(items, folder)
    );
  }
  return copy;
}

function buildFoldersAndFiles(files: FileSystemItem[]) {
  const nonDeletedFiles = files.filter((file) => !file.deletedAt);
  const rootItems = nonDeletedFiles.filter((file) => !file.parentId);
  const deletedItems = files.filter((file) => file.deletedAt);
  const trashFolder: FileSystemItemWithChildren = {
    id: 'trash',
    name: 'Trash',
    type: 'folder',
    children: deletedItems,
  };

  return [
    trashFolder,
    ...rootItems.map((folder) =>
      buildNestedFileSystem(nonDeletedFiles, folder)
    ),
  ];
}

const CodeSnippets = () => {
  const { items, cleanExpiredTrashItems } = useStore();
  const system = useMemo(() => buildFoldersAndFiles(items), [items]);

  useEffect(() => {
    cleanExpiredTrashItems();
  }, [cleanExpiredTrashItems]);

  return (
    <div>
      <SimpleCodeEditor initialFileSystem={system} />
    </div>
  );
};

export { CodeSnippets as Component };
