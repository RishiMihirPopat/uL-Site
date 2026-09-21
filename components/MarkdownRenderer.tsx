'use client';

import React from 'react';
import styles from './MarkdownRenderer.module.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Parses inline markdown: bold, italic, strikethrough, inline code, and links.
 */
function renderInline(text: string): React.ReactNode[] {
  // Regex to match code, links, bold/italic, strikethrough
  const tokens: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // 1. Inline code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      tokens.push(<code key={`code-${key++}`} className={styles.inlineCode}>{codeMatch[1]}</code>);
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // 2. Links: [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      const isExternal = linkMatch[2].startsWith('http');
      tokens.push(
        <a
          key={`link-${key++}`}
          href={linkMatch[2]}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className={styles.link}
        >
          {linkMatch[1]} {isExternal && '↗'}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // 3. Bold + Italic: ***text*** or ___text___
    const boldItalicMatch = remaining.match(/^(\*\*\*|___)(.+?)\1/);
    if (boldItalicMatch) {
      tokens.push(
        <strong key={`bi-${key++}`}>
          <em>{boldItalicMatch[2]}</em>
        </strong>
      );
      remaining = remaining.slice(boldItalicMatch[0].length);
      continue;
    }

    // 4. Bold: **text** or __text__
    const boldMatch = remaining.match(/^(\*\*|__)(.+?)\1/);
    if (boldMatch) {
      tokens.push(<strong key={`b-${key++}`}>{boldMatch[2]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // 5. Italic: *text* or _text_
    const italicMatch = remaining.match(/^(\*|_)(.+?)\1/);
    if (italicMatch) {
      tokens.push(<em key={`i-${key++}`}>{italicMatch[2]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // 6. Strikethrough: ~~text~~
    const strikeMatch = remaining.match(/^~~(.+?)~~/);
    if (strikeMatch) {
      tokens.push(<del key={`del-${key++}`}>{strikeMatch[1]}</del>);
      remaining = remaining.slice(strikeMatch[0].length);
      continue;
    }

    // 7. Regular text until next special markdown character
    const nextSpecial = remaining.search(/[`\[\*_~]/);
    if (nextSpecial === -1) {
      tokens.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      // If special char didn't match any pattern, treat as literal character
      tokens.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      tokens.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return tokens;
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let index = 0;

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Blank line
    if (!line) {
      i++;
      continue;
    }

    // Horizontal Rule: --- or ***
    if (/^(\-{3,}|\*{3,})$/.test(line)) {
      blocks.push(<hr key={`hr-${index++}`} className={styles.divider} />);
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('#### ')) {
      blocks.push(<h4 key={`h4-${index++}`} className={styles.h4}>{renderInline(line.slice(5))}</h4>);
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push(<h3 key={`h3-${index++}`} className={styles.h3}>{renderInline(line.slice(4))}</h3>);
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push(<h2 key={`h2-${index++}`} className={styles.h2}>{renderInline(line.slice(3))}</h2>);
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      blocks.push(<h1 key={`h1-${index++}`} className={styles.h1}>{renderInline(line.slice(2))}</h1>);
      i++;
      continue;
    }

    // Blockquote: > Quote
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      blocks.push(
        <blockquote key={`quote-${index++}`} className={styles.blockquote}>
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx} className={styles.quoteParagraph}>{renderInline(ql)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Unordered List: - or *
    if (/^[-*]\s+/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      blocks.push(
        <ul key={`ul-${index++}`} className={styles.unorderedList}>
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className={styles.listItem}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered List: 1. 2.
    if (/^\d+\.\s+/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push(
        <ol key={`ol-${index++}`} className={styles.orderedList}>
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className={styles.listItem}>{renderInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Image: ![alt](url)
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      blocks.push(
        <figure key={`img-${index++}`} className={styles.figure}>
          <div className={styles.imageWrap}>
            <img src={imgMatch[2]} alt={imgMatch[1]} className={styles.articleImg} />
          </div>
          {imgMatch[1] && <figcaption className={styles.figcaption}>{imgMatch[1]}</figcaption>}
        </figure>
      );
      i++;
      continue;
    }

    // Paragraph
    blocks.push(
      <p key={`p-${index++}`} className={styles.paragraph}>
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className={`${styles.prose} ${className || ''}`}>{blocks}</div>;
}
