import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';
import { FileTreeNode } from '../utils/folderUtils';

interface FileTreeProps {
  fileTree: FileTreeNode[];
  currentFilePath: string | null;
  onFileSelect: (filePath: string) => void;
}

export function FileTree({ fileTree, currentFilePath, onFileSelect }: FileTreeProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const toggleExpand = (path: string) => {
    setExpandedPaths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const renderNode = (node: FileTreeNode, depth: number = 0) => {
    const isExpanded = expandedPaths.has(node.path);
    const isSelected = currentFilePath === node.path;

    if (node.type === 'directory') {
      return (
        <div key={node.path}>
          <div
            className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-gray-100 rounded text-sm ${
              isSelected ? 'bg-blue-50' : ''
            }`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
            onClick={() => toggleExpand(node.path)}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
            <Folder className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700">{node.name}</span>
          </div>
          {isExpanded && node.children && (
            <div>
              {node.children.map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={node.path}
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-gray-100 rounded text-sm ${
          isSelected ? 'bg-blue-100 font-medium' : ''
        }`}
        style={{ paddingLeft: `${depth * 16 + 24}px` }}
        onClick={() => onFileSelect(node.path)}
      >
        <File className="w-4 h-4 text-gray-500" />
        <span className={isSelected ? 'text-blue-700' : 'text-gray-700'}>
          {node.name}
        </span>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-white rounded-lg p-2 border border-gray-200">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
        Files
      </div>
      <div className="space-y-0">
        {fileTree.map((node) => renderNode(node))}
      </div>
    </div>
  );
}

