import { DataType, OffsetType, StyleType } from './types';

type PageConstructorParams = {
  height: number;
  data: DataType;
  onDraw: () => void;
};

class Offset implements OffsetType {
  public readonly x: number;
  public readonly y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  get distance() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  add = (offset: OffsetType) => {
    return new Offset(this.x + offset.x, this.y + offset.y);
  };

  subtract = (offset: OffsetType) => {
    return new Offset(this.x - offset.x, this.y - offset.y);
  };

  divide = (offset: OffsetType) => {
    return new Offset(this.x - offset.x, this.y - offset.y);
  };

  get operator() {
    return {
      add: (n: number) => new Offset(this.x + n, this.y + n),
      subtract: (n: number) => new Offset(this.x - n, this.y - n),
      divide: (n: number) => new Offset(this.x / n, this.y / n),
      multiplication: (n: number) => new Offset(this.x * n, this.y * n),
    };
  }
}

class Page {
  private params: PageConstructorParams;
  private ctx: CanvasRenderingContext2D;
  public readonly canvas: HTMLCanvasElement;
  private circleSizeRate = 0.0122;
  private spiralCenterWidth = 0.0732;
  private spiralStartPoint = 0;

  constructor(params: PageConstructorParams) {
    this.params = params;

    const { canvas, ctx } = this.getCanvas();

    this.ctx = ctx;
    this.canvas = canvas;
  }

  get config() {
    const circleSize = this.params.height * this.circleSizeRate;
    const width = (21 * this.params.height) / 29; // A4 page

    return {
      width,
      centerOffset: {
        x: width / 2 - (circleSize / 3) * 2,
        y: this.params.height / 2,
      } as OffsetType,
      circleSize,
      connectorSize: circleSize / 7.5,
      space: circleSize / 4,
      quality: 80,
    } as const;
  }

  get style(): Record<'title' | 'circleContent' | 'bottomText', StyleType> {
    return {
      title: {
        color: '#808080',
        fontSize: this.params.height * 0.03,
      },
      circleContent: {
        color: '#808080',
        fontSize: this.config.circleSize * 0.6,
      },
      bottomText: {
        color: '#808080',
        fontSize: this.config.circleSize * 0.3,
      },
    };
  }
  changeCircleSize = (rangeValue: number) => {
    this.circleSizeRate = rangeValue;
  };

  changeSpiralCenterWidth = (rangeValue: number) => {
    this.spiralCenterWidth = rangeValue;
  };

  changeSpiralStartPoint = (rangeValue: number) => {
    this.spiralStartPoint = rangeValue;
  };

  getCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = this.config.width;
    canvas.height = this.params.height;
    canvas.style.backgroundColor = 'white';
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    ctx.moveTo(this.config.centerOffset.x, this.config.centerOffset.y);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    return { canvas, ctx };
  };

  fillText = ({
    style,
    text,
    offset,
  }: {
    style: StyleType;
    text: string;
    offset: OffsetType;
  }) => {
    this.ctx.font = `${style.fontSize}px Arial`;
    this.ctx.fillStyle = style.color;
    this.ctx.fillText(text, offset.x, offset.y);
  };

  getAngle = (index: number) => (0.01 / this.config.quality) * index;

  getOffsetByIndex = (index: number): Offset => {
    const spiralCenterWidth = this.params.height * this.spiralCenterWidth;
    const spaceBetweenLine = this.config.circleSize / 2;
    const angle = this.getAngle(index);

    const angleOffset = new Offset(Math.cos(angle), Math.sin(angle));

    const offset = angleOffset.operator
      .multiplication(spiralCenterWidth)
      .add(angleOffset.operator.multiplication(spaceBetweenLine * angle))
      .add(this.config.centerOffset);

    return offset;
  };

  // getIndexByOffset = ({ x, y }: OffsetType) => {
  //   const offset = new Offset(x, y);
  //   const rawOffset = offset.subtract(this.config.centerOffset);
  // };

  drawArc = (offset: OffsetType, size: number) => {
    this.ctx.moveTo(offset.x + size, offset.y);
    this.ctx.arc(offset.x, offset.y, size, 0, 2 * Math.PI, true);
  };

  draw = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const { title, items } = this.params.data;

    if (title) {
      this.fillText({
        style: this.style.title,
        text: title,
        offset: this.config.centerOffset,
      });
    }
    let prev = this.getOffsetByIndex(1);

    let skipCount = Math.round(
      this.spiralStartPoint * this.params.data.items.length
    );

    let index = 0;

    let i = 1;

    while (index < items.length) {
      i++;
      const offset = this.getOffsetByIndex(i);
      const diffOffset = offset.subtract(prev);
      const distanceBetweenPrev = diffOffset.distance;
      const isNextPlace =
        distanceBetweenPrev >= this.config.circleSize * 2 + this.config.space;

      if (isNextPlace && skipCount > 0) {
        skipCount--;
        prev = offset;
      } else if (isNextPlace) {
        const item = items[index];

        this.ctx.beginPath();

        this.drawArc(offset, this.config.circleSize);

        this.fillText({
          style: this.style.circleContent,
          offset,
          text: item.text,
        });

        if (item.bottomText) {
          this.fillText({
            style: this.style.bottomText,
            offset: offset.add({
              x: 0,
              y:
                this.style.circleContent.fontSize -
                this.style.bottomText.fontSize / 2,
            }),
            text: item.bottomText,
          });
        }

        if (index > 0) {
          const connectorOffset = offset.subtract(
            diffOffset.operator.divide(2)
          );

          this.drawArc(connectorOffset, this.config.connectorSize);
        }

        prev = offset;
        index++;

        this.ctx.stroke();
      }
    }
    this.params.onDraw();
  };
}

let worked = false;
export function run() {
  if (worked) {
    return;
  }
  worked = true;
  let data: DataType;
  const previewImage = document.getElementById('preview') as HTMLImageElement;
  const circleSizeRangeInput = document.getElementById(
    'circleSizeRange'
  ) as HTMLInputElement;

  const spiralCenterWidthRangeInput = document.getElementById(
    'spiralCenterWidthRange'
  ) as HTMLInputElement;

  const spiralStartPointRangeInput = document.getElementById(
    'spiralStartPointRange'
  ) as HTMLInputElement;

  let page: Page | undefined;

  function handleFileSelect(evt: any) {
    const [file] = evt.target.files;

    const reader = new FileReader();

    reader.onload = function (e: any) {
      data = JSON.parse(e.target.result);

      if (page) {
        // remove old canvas
        page.canvas.remove();
      }

      page = new Page({
        height: 7000,
        data,
        onDraw: () => {
          if (page) {
            const img = page.canvas.toDataURL('image/png');
            previewImage.src = img;
          }
        },
      });
      page.draw();
    };

    reader.readAsText(file);
  }

  document
    .getElementById('upload')
    ?.addEventListener('change', handleFileSelect, false);

  circleSizeRangeInput.addEventListener('change', (e: any) => {
    const val = parseFloat(e.target.value);
    if (page) {
      page.changeCircleSize(val);
      page.draw();
    }
  });

  spiralCenterWidthRangeInput.addEventListener('change', (e: any) => {
    const val = parseFloat(e.target.value);
    if (page) {
      page.changeSpiralCenterWidth(val);
      page.draw();
    }
  });

  spiralStartPointRangeInput.addEventListener('change', (e: any) => {
    const val = parseFloat(e.target.value);
    if (page) {
      page.changeSpiralStartPoint(val);
      page.draw();
    }
  });
}
