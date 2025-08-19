import React from 'react';

type Token =
  | { type: 'title'; content: string }
  | { type: 'subtitle'; content: string }
  | { type: 'paragraph'; content: string }
  | { type: 'video'; url: string }
  | { type: 'newline' }
  | { type: 'separator' };
  

interface CustomMarkdownProps {
  children: string;
}

const CustomMarkdown: React.FC<CustomMarkdownProps> = ({ children }) => {
  const tokens = parseLesson(children);
  return <>{renderLesson(tokens)}</>;
};

// --- Parser ---
function parseLesson(text: string): Token[] {
  const lines = text.split(/\r?\n/);
  const tokens: Token[] = [];

  for (let line of lines) {
    line = line.trim();

    if (!line) {
      tokens.push({ type: 'newline' });
      continue;
    }

    if (line === '---') {
      tokens.push({ type: 'separator' });
    }
    else if (line.startsWith('## ')) {
      tokens.push({ type: 'subtitle', content: line.slice(3).trim() });
    } else if (line.startsWith('# ')) {
      tokens.push({ type: 'title', content: line.slice(2).trim() });
    } else if (line.startsWith('#video ')) {
      let url = line.slice(7).trim();
      if (url.includes('drive.google.com') && url.includes('/view')) {
        url = url.replace('/view', '/preview'); // optional Google Drive fix
      }
      tokens.push({ type: 'video', url: line.slice(7).trim() });
    } else {
      tokens.push({ type: 'paragraph', content: line });
    }
  }

  return tokens;
}

// --- Renderer ---
function renderLesson(tokens: Token[]) {
  return tokens.map((token, idx) => {
    switch (token.type) {
      case 'separator':
        return <hr key={idx} style={{ margin: '2em 0' }} />;
      case 'title':
        return <h1 key={idx}>{token.content}</h1>;
      case 'subtitle':
        return <h2 key={idx}>{token.content}</h2>;
      case 'paragraph':
        return <p key={idx}>{renderInline(token.content)}</p>;
      case 'video':
        return (
          <div key={idx} className="relative w-full pb-[56.25%] my-4">
            <iframe
              src={token.url}
              className="absolute top-0 left-0 w-full h-full border-0"
              allowFullScreen
            />
          </div>
        );
      case 'newline':
        return <br key={idx} />;
    }
  });
}

// --- Inline formatting (*italic*, **bold**) ---
function renderInline(text: string) {
  let parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      parts.push(<strong key={match.index}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={match.index}>{match[3]}</em>);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export default CustomMarkdown;
