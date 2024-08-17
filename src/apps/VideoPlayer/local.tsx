import React, { useEffect, useMemo, useRef, useState } from 'react';
import srtParser2 from 'srt-parser-2';
import { Button } from '@/components/ui/button';
import { downloadJsonFile } from '@/utils/file';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InfoIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import './style.scss';
import Video from './Video';

const parser = new srtParser2();

const LocalVideoPlayer = () => {
  const [videoFile, setVideoFile] = useState<File>();
  const [srtJson, setSrtJson] = useState<
    ReturnType<(typeof parser)['fromSrt']>
  >([]);
  const [activeSubtitle, setActiveSubtitle] = useState<string>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [adjustSecond, setAdjustSecond] = useState(0);

  const videoUrl = useMemo(() => {
    if (!videoFile) {
      return undefined;
    }

    const objectUrl = URL.createObjectURL(videoFile);

    return objectUrl;
  }, [videoFile]);

  const subtitle = useMemo(() => {
    return srtJson.map((i) => ({
      ...i,
      startSeconds: i.startSeconds + adjustSecond,
      endSeconds: i.endSeconds + adjustSecond,
    }));
  }, [adjustSecond, srtJson]);

  const onSubtitleUploaded = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    const file = e.target.files?.[0];
    const isJsonFile = file?.name.endsWith('.json');

    if (!file) {
      return alert('No file selected');
    }

    reader.addEventListener('load', (e) => {
      if (isJsonFile) {
        setSrtJson(JSON.parse(e.target?.result as string));
        return;
      }

      setSrtJson(parser.fromSrt(e.target?.result as string));
    });

    reader.readAsText(file);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!videoRef.current || !subtitle.length) {
        return;
      }

      const currentSeconds = videoRef?.current?.currentTime;

      const currentSubtitle = subtitle.find(
        (s) =>
          s.startSeconds <= currentSeconds && s.endSeconds >= currentSeconds
      );

      setActiveSubtitle(currentSubtitle?.text);
    }, 250);

    return () => {
      clearInterval(interval);
    };
  }, [subtitle]);

  if (!videoFile) {
    return (
      <div>
        <label>
          Subtitle: <input type="file" onChange={onSubtitleUploaded} />
        </label>

        <label>
          Video:{' '}
          <input
            type="file"
            onChange={(e) => {
              setVideoFile(e.target.files?.[0]);
            }}
          />
        </label>
      </div>
    );
  }

  return (
    <div className="p-4 overflow-y-auto">
      <div className="video-player">
        <Video videoUrl={videoUrl!} videoRef={videoRef} />
        {srtJson.length > 0 && (
          <pre
            className="video-player-caption"
            dangerouslySetInnerHTML={{ __html: activeSubtitle || '' }}
          />
        )}
      </div>
      <div className="flex gap-4 mt-2">
        <Button
          onClick={() =>
            document.querySelector('.video-player')?.requestFullscreen()
          }
        >
          Full Screen
        </Button>
        {srtJson.length > 0 && (
          <>
            <div className="flex flex-col gap-2">
              <Label className="flex gap-2">
                <span>Adjust</span>
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <InfoIcon size={16} />
                    </TooltipTrigger>
                    <TooltipContent className="mb-2">
                      <pre>
                        Increase: If you see captions before the voice
                        <br />
                        Decrease: If you see captions after the voice
                      </pre>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                placeholder="Adjust"
                type="number"
                value={adjustSecond}
                onChange={(e) => setAdjustSecond(parseFloat(e.target.value))}
              />
              <Button
                onClick={() =>
                  downloadJsonFile(subtitle, `${videoFile.name}-subtitle.json`)
                }
              >
                Download Adjusted Subtitle
              </Button>

              <label>
                Change Subtitle:{' '}
                <input type="file" onChange={onSubtitleUploaded} />
              </label>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Input id="remove-all-input" />
                <Button
                  onClick={() => {
                    const input = document.getElementById(
                      'remove-all-input'
                    ) as HTMLInputElement;
                    const value = input.value;
                    setSrtJson(
                      JSON.parse(JSON.stringify(srtJson).replaceAll(value, ''))
                    );
                  }}
                >
                  Remove All
                </Button>
              </div>

              <pre className="max-h-96 overflow-y-scroll">
                {JSON.stringify(subtitle, null, 2)}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LocalVideoPlayer;
