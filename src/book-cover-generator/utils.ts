// @ts-ignore
import glur from 'glur';

function roundedImage(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function getImageSizeByRatio(
  imgWidth: number,
  imgHeight: number,
  cWidth: number,
  cHeight: number,
  isBackground?: boolean
) {
  const isVerticalImage = imgWidth < imgHeight;

  const heightByRatio = (cWidth * imgHeight) / imgWidth;
  const widthByRatio = (cHeight * imgWidth) / imgHeight;

  if (isBackground) {
    return [cWidth, heightByRatio] as const;
  }
  const height = isVerticalImage ? Math.min(imgHeight, cHeight) : heightByRatio;

  const width = isVerticalImage ? widthByRatio : Math.min(imgWidth, cWidth);
  return [width, height] as const;
}
export function draw(
  canvas: HTMLCanvasElement,
  baseFileUrl: string,
  bgFileUrl: string,
  spacing: number
) {
  return new Promise<void>((done) => {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (baseFileUrl && bgFileUrl) {
      const bgImageInstance = new Image();
      bgImageInstance.onload = () => {
        const [newImageWidth, newImageHeight] = getImageSizeByRatio(
          bgImageInstance.naturalWidth,
          bgImageInstance.naturalHeight,
          canvas.width,
          canvas.height,
          true
        );

        const centerX = (canvas.width - newImageWidth) / 2;
        const centerY = (canvas.height - newImageHeight) / 2;

        ctx.drawImage(
          bgImageInstance,
          centerX,
          centerY,
          newImageWidth,
          newImageHeight
        );

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        glur(imageData.data, canvas.width, canvas.height, 7);
        ctx.putImageData(imageData, 0, 0);
        const baseImageInstance = new Image();
        baseImageInstance.onload = () => {
          const cWidth = canvas.width - canvas.width * spacing;
          const cHeight = canvas.height - canvas.height * spacing;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 3;
          ctx.shadowBlur = 15;
          ctx.shadowColor = 'rgba(21, 24, 50, 0.3)';
          ctx.fillStyle = 'tomato';

          const [newImageWidth, newImageHeight] = getImageSizeByRatio(
            baseImageInstance.naturalWidth,
            baseImageInstance.naturalHeight,
            cWidth,
            cHeight
          );
          const centerX = (canvas.width - newImageWidth) / 2;
          const centerY = (canvas.height - newImageHeight) / 2;

          ctx.save();
          roundedImage(
            ctx,
            centerX,
            centerY,
            newImageWidth,
            newImageHeight,
            10
          );
          ctx.clip();
          ctx.drawImage(
            baseImageInstance,
            centerX,
            centerY,
            newImageWidth,
            newImageHeight
          );
          ctx.restore();

          done();
        };
        baseImageInstance.src = baseFileUrl;
      };
      bgImageInstance.src = bgFileUrl;
    }
  });
}
