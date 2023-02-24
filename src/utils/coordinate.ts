export type CoordinateType = {
  latitude: number;
  longitude: number;
};
export const getCord = (value: string): CoordinateType => {
  const [latitude, longitude] = value
    .split(',')
    .map((i) => i.trim())
    .map((i) => parseFloat(i));

  return { latitude, longitude };
};
