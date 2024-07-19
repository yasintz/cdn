export function stringToColor(
  str: string,
  level: 'dark' | 'light' | 'normal' = 'normal'
) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xff;

    if (level === 'dark') {
      value = Math.floor(value / 2);
    }

    if (level === 'light') {
      value = Math.floor((value + 255) / 2);
    }
    color += value.toString(16).padStart(2, '00');
  }

  return color;
}

export const tagsColor: Record<string, string> = {
  bad: '#dd2a29',
  sleep: '#ca8a03',
  ibadet: '#2463eb',
  free: '#24b021',
  finance: '#d78b12',
};

export const toRGB = (color: string) => {
  const { style } = new Option();
  style.color = color;
  const rgb = style.color;

  const [r, g, b] = rgb.replace('rgb(', '').replace(')', '').split(',');

  return { r, g, b };
};

export function hashCode(t: string) {
  let hash = 0,
    i = 0;
  const len = t.length;
  while (i < len) {
    hash = ((hash << 5) - hash + t.charCodeAt(i++)) << 0;
  }
  return hash + 2147483647 + 1;
}
export const defaultNoteUrl =
  'https://playground.lexical.dev/?showTreeView=false#doc=H4sIAAAAAAAAE5XOzQrCMBAE4HeZc5DEf_MAnoUexcPSrDUQk7LdFov03UXxUI-ehjl8wzzBIWqRSkkZ_gkpRd9Z32IKwhn-_FMuBiEK1xpLhs99SgbXIndSeMAg5sBZ4a2Bji3DoyWhRqi9wWBg6T7QGSg_9PiVdvp_9_N0PjlNBok6rWjgAO92br_cuPV-dbBbg670Ur_dKdHYSOlzmGvYhdsuLKYXPaCc5RIBAAA';
