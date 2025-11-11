// Generate 24 hours starting from startTime and wrapping around
export function generateHourBlocks(startTime: string): string[] {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const startTotalMinutes = startHour * 60 + startMin;
  
  const blocks: string[] = [];
  for (let i = 0; i < 24; i++) {
    const totalMinutes = (startTotalMinutes + i * 60) % (24 * 60);
    const hour = Math.floor(totalMinutes / 60);
    const min = totalMinutes % 60;
    blocks.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
  }
  
  return blocks;
}

