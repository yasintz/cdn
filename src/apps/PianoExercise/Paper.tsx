import React from 'react';
import ReactDOM from 'react-dom/server';
import headPng from './head.png';
import linesPng from './lines.png';

export type PositionType = 'up' | 'down';

export type NoteType = 'do' | 're' | 'mi' | 'fa' | 'sol' | 'la' | 'si';

type NoteInfoType = {
  note: NoteType;
  beat: number;
};

const positionsByNote: Record<PositionType, Record<NoteType, number>> = {
  up: {
    do: 32,
    re: 29,
    mi: 26,
    fa: 22.5,
    sol: 20,
    la: 16,
    si: 13,
  },
  down: {
    do: 35,
    si: 32,
    la: 29,
    sol: 26.6,
    fa: 23,
    mi: 20,
    re: 17,
  },
};

const sizes = {
  circle: {
    width: 16,
    height: 14,
  },

  line: {
    width: 2,
    height: 30,
  },
};
const canvasSize = sizes.circle.width * 2;

const Circle = ({
  width,
  height,
  top,
  fill,
}: {
  top: number;
  width: number;
  height: number;
  fill: boolean;
}) => {
  const border = 2;
  const c = (canvasSize - width) / 2;
  return (
    <ellipse
      rx={width / 2}
      ry={height / 2}
      cx={width / 2 + border / 2 + c}
      cy={top + height / 2}
      stroke="black"
      strokeWidth={border}
      fill={fill ? 'black' : 'white'}
    />
  );
};

const Line = ({
  width,
  height,
  left,
}: {
  width: number;
  height: number;
  left: number;
}) => {
  const c = (canvasSize - left) / 2;
  return (
    <line
      x1={left + c}
      x2={left + c}
      y1={height}
      y2={0}
      strokeWidth={width}
      stroke="black"
    />
  );
};

const CenterDoLine = () => {
  const width = sizes.circle.width * 1.5;
  const left = (canvasSize - width) / 2;
  return (
    <line
      x1={left}
      x2={left + width + 1}
      y1={sizes.line.height}
      y2={sizes.line.height}
      strokeWidth={2}
      stroke="black"
    />
  );
};

const beats: Record<number, () => JSX.Element> = {
  1: () => (
    <>
      <Circle
        width={sizes.circle.width}
        height={sizes.circle.height}
        fill
        top={sizes.line.height - sizes.circle.height / 2}
      />
      <Line
        width={sizes.line.width}
        height={sizes.line.height}
        left={sizes.circle.width}
      />
    </>
  ),
  2: () => (
    <>
      <Circle
        width={sizes.circle.width}
        height={sizes.circle.height}
        fill={false}
        top={sizes.line.height - sizes.circle.height / 2}
      />
      <Line
        width={sizes.line.width}
        height={sizes.line.height}
        left={sizes.circle.width}
      />
    </>
  ),
  4: () => (
    <>
      <Circle
        width={sizes.circle.width}
        height={sizes.circle.height}
        fill={false}
        top={sizes.line.height - sizes.circle.height / 2}
      />
    </>
  ),
};

function RenderNote({
  note,
  index,
  position,
}: {
  note: NoteInfoType | undefined;
  index: number;
  position: PositionType;
}) {
  if (!note) {
    return null;
  }

  const Beat = beats[note.beat];
  const svg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      key={index}
      width={canvasSize}
      height={sizes.line.height + sizes.circle.height / 2 + 2}
    >
      <Beat />
      {note.note === 'do' && <CenterDoLine />}
    </svg>
  );

  const svgString = ReactDOM.renderToString(svg);
  const base64 = btoa(svgString);
  const imgSource = `data:image/svg+xml;base64,${base64}`;
  const po = positionsByNote[position][note.note];
  return (
    <img
      src={imgSource}
      className="absolute"
      style={{
        left: `${10 + index * 6}%`,
        height: '15%',
        top: position === 'up' ? `${po}%` : undefined,
        bottom: position === 'down' ? `${po}%` : undefined,
        transform: position === 'down' ? `rotate(180deg)` : undefined,
      }}
    />
  );
}

type PaperProps = {
  upNotes: NoteInfoType[];
  downNotes: NoteInfoType[];
};

const Paper = ({ upNotes, downNotes }: PaperProps) => {
  return (
    <div className="flex w-full h-full relative">
      <img src={headPng} alt="head" className="h-full" />
      <img src={linesPng} alt="lines" className="flex-1 h-full" />

      {downNotes.map((note, index) => {
        return (
          <RenderNote key={index} note={note} index={index} position="down" />
        );
      })}
      {upNotes.map((note, index) => {
        return (
          <RenderNote key={index} note={note} index={index} position="up" />
        );
      })}
    </div>
  );
};

export default Paper;
