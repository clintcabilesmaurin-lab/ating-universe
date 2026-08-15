import React from 'react';
import { Mountain, ExternalLink, Sparkles, Image as ImageIcon, Camera } from 'lucide-react';
import { PANGILATAN_FOLDER_URL, RANDOM_MEMORIES_FOLDER_URL } from '../utils/driveHelper';

interface DriveDirectLinkNoticeProps {
  folderType?: 'pangilatan' | 'random' | 'both';
  onOpenPhotoManager?: () => void;
}

export const DriveDirectLinkNotice: React.FC<DriveDirectLinkNoticeProps> = ({
  folderType = 'both',
  onOpenPhotoManager,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-100 space-y-3 my-3 text-xs font-sans">
      <div className="flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-emerald-200">
            Naka-link ang inyong Google Drive photo storage para sa mga alaala ni Clint at Maica!
          </p>
          <p className="text-emerald-300/80 leading-relaxed">
            Dahil ang Google Drive folder link ay buong webpage, maaari mong i-upload ang mga larawan o i-paste ang bawat direct image link/ID upang maipakita rito.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {onOpenPhotoManager && (
          <button
            onClick={onOpenPhotoManager}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 text-slate-950 font-medium hover:bg-amber-300 transition-colors shadow-md cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Ayusin / I-upload ang mga Larawan</span>
          </button>
        )}

        {(folderType === 'pangilatan' || folderType === 'both') && (
          <a
            href={PANGILATAN_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/40 text-emerald-200 transition-colors"
          >
            <Mountain className="w-3.5 h-3.5" />
            <span>Pangilatan Folder</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        )}

        {(folderType === 'random' || folderType === 'both') && (
          <a
            href={RANDOM_MEMORIES_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-purple-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Random Photos Folder</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        )}
      </div>
    </div>
  );
};
