export function generateId(length: number, chars: string): string {
  let mask = '';
  if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
  if (chars.indexOf('0') > -1) mask += '0123456789';
  if (chars.indexOf('#') > -1) mask += '.,?#$';

  let result = '';
  for (let i = length; i > 0; --i)
    result += mask[Math.floor(Math.random() * mask.length)];

  if (!isNaN(result as any)) {
    return generateId(length, chars);
  } else {
    return result;
  }
}
