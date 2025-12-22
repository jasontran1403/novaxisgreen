import { useState } from 'react';

function ReflinkSection({ leftRefLink, rightRefLink }) {
  const [copiedLink, setCopiedLink] = useState(null);

  const copyToClipboard = (text, linkType) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedLink(linkType);
      setTimeout(() => setCopiedLink(null), 2000);
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left Reflink */}
      <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-4 glow-border glow-border-hover">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-emerald-400 dark:text-emerald-300">
            Left Reflink
          </h3>
          <span className="text-xs px-2 py-1 bg-emerald-500/20 dark:bg-emerald-400/20 text-emerald-400 dark:text-emerald-300 rounded">
            Left
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={leftRefLink}
            readOnly
            className="flex-1 px-3 py-2 bg-slate-600 dark:bg-gray-900 border border-emerald-500/30 dark:border-emerald-400/30 rounded text-sm text-emerald-300 dark:text-emerald-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400"
          />
          <button
            onClick={() => copyToClipboard(leftRefLink, 'left')}
            className="px-4 py-2 bg-emerald-500 dark:bg-emerald-400 text-white dark:text-gray-900 rounded hover:bg-emerald-400 dark:hover:bg-emerald-300 transition-all text-sm font-medium"
          >
            {copiedLink === 'left' ? '✓' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Right Reflink */}
      <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-4 glow-border glow-border-hover">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-emerald-400 dark:text-emerald-300">
            Right Reflink
          </h3>
          <span className="text-xs px-2 py-1 bg-emerald-500/20 dark:bg-emerald-400/20 text-emerald-400 dark:text-emerald-300 rounded">
            Right
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={rightRefLink}
            readOnly
            className="flex-1 px-3 py-2 bg-slate-600 dark:bg-gray-900 border border-emerald-500/30 dark:border-emerald-400/30 rounded text-sm text-emerald-300 dark:text-emerald-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400"
          />
          <button
            onClick={() => copyToClipboard(rightRefLink, 'right')}
            className="px-4 py-2 bg-emerald-500 dark:bg-emerald-400 text-white dark:text-gray-900 rounded hover:bg-emerald-400 dark:hover:bg-emerald-300 transition-all text-sm font-medium"
          >
            {copiedLink === 'right' ? '✓' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReflinkSection;

