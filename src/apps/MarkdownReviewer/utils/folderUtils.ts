export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
}

export async function buildFileTree(
  directoryHandle: FileSystemDirectoryHandle,
  basePath: string = ''
): Promise<FileTreeNode[]> {
  const nodes: FileTreeNode[] = [];

  for await (const [name, handle] of directoryHandle.entries()) {
    if (handle.kind === 'directory') {
      const path = basePath ? `${basePath}/${name}` : name;
      const children = await buildFileTree(handle, path);
      
      // Only include directories that contain markdown files or have subdirectories with markdown files
      if (children.length > 0) {
        nodes.push({
          name,
          path,
          type: 'directory',
          children,
        });
      }
    } else if (handle.kind === 'file' && name.endsWith('.md')) {
      const path = basePath ? `${basePath}/${name}` : name;
      nodes.push({
        name,
        path,
        type: 'file',
      });
    }
  }

  // Sort: directories first, then files, both alphabetically
  nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  return nodes;
}

export async function getFileByPath(
  directoryHandle: FileSystemDirectoryHandle,
  filePath: string
): Promise<{ file: File; fileName: string } | null> {
  const parts = filePath.split('/');
  let currentHandle: FileSystemDirectoryHandle | FileSystemFileHandle = directoryHandle;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const isLast = i === parts.length - 1;

    if (isLast) {
      // Last part should be a file
      try {
        const fileHandle = await (currentHandle as FileSystemDirectoryHandle).getFileHandle(part);
        const file = await fileHandle.getFile();
        return { file, fileName: part };
      } catch (error) {
        console.error(`Error accessing file ${part}:`, error);
        return null;
      }
    } else {
      // Intermediate parts should be directories
      try {
        currentHandle = await (currentHandle as FileSystemDirectoryHandle).getDirectoryHandle(part);
      } catch (error) {
        console.error(`Error accessing directory ${part}:`, error);
        return null;
      }
    }
  }

  return null;
}

