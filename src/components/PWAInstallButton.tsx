import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, X, PlusSquare } from 'lucide-react';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#cfc7b6] bg-[#ede7d8] hover:bg-[#e2dbcb] text-[#2b2926] text-xs font-mono transition-colors shadow-2xs cursor-pointer ${className}`}
        title="Install Pip's Adventures App"
      >
        <Download className="w-3.5 h-3.5 text-[#554f44]" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#cfc7b6] bg-[#ede7d8] hover:bg-[#e2dbcb] text-[#2b2926] text-xs font-mono transition-colors shadow-2xs cursor-pointer ${className}`}
          title="Add to Home Screen"
        >
          <Download className="w-3.5 h-3.5 text-[#554f44]" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-xl bg-[#faf7ee] border-2 border-[#d5cebd] p-5 shadow-2xl text-[#2b2926] paper-ruled">
              <div className="flex items-center justify-between pb-3 border-b border-[#e2dccf]">
                <h3 className="text-base font-handwriting text-xl font-bold">Install Pip&rsquo;s Adventures</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded hover:bg-[#ede7da] text-[#555046] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs font-mono text-[#524d45] leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded bg-[#ede7d8] border border-[#d2cab9] shrink-0 text-[#2b2926]">
                    <Share className="w-4 h-4" />
                  </div>
                  <div>
                    1. Tap the <strong className="text-[#2b2926]">Share</strong> button in Safari&rsquo;s bottom toolbar.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded bg-[#ede7d8] border border-[#d2cab9] shrink-0 text-[#2b2926]">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    2. Scroll down and tap <strong className="text-[#2b2926]">Add to Home Screen</strong>.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-md bg-[#2b2926] hover:bg-[#3d3a36] py-2 text-xs font-mono text-[#faf7ee] transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
