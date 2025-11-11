// Generate 24 hours starting from 00:00
export function generateHourBlocks(): string[] {
  const blocks: string[] = [];
  for (let i = 0; i < 24; i++) {
    const hour = i;
    blocks.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  
  return blocks;
}

