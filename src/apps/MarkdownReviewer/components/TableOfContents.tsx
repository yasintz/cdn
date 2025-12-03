import { useMemo } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  htmlContent: string;
  previewRef: React.RefObject<HTMLDivElement | null>;
}

export function TableOfContents({ htmlContent, previewRef }: TableOfContentsProps) {
  const headings = useMemo<Heading[]>(() => {
    if (!htmlContent) return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

    return Array.from(headingElements).map((heading, index) => ({
      id: `heading-${index}`,
      text: heading.textContent || '',
      level: parseInt(heading.tagName[1]),
    }));
  }, [htmlContent]);

  const handleHeadingClick = (index: number) => {
    if (!previewRef.current) return;

    const headingElements = previewRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const targetHeading = headingElements[index];

    if (targetHeading) {
      targetHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">Table of Contents</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {headings.map((heading, index) => (
            <button
              key={heading.id}
              onClick={() => handleHeadingClick(index)}
              className="w-full text-left py-1.5 px-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors block"
              style={{
                paddingLeft: `${(heading.level - 1) * 12 + 8}px`,
              }}
              title={heading.text}
            >
              <span className="block truncate">{heading.text}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
