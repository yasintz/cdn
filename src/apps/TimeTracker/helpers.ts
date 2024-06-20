import _ from 'lodash';

export function parseTagsFromTitle(title: string) {
  return {
    title,
    titleRaw: title
      .split(' ')
      .filter((t) => !isTag(t))
      .join(' '),
    tags: _.uniq(title.split(' ').filter(isTag)),
  };
}

export function isTag(t: string) {
  return t.startsWith('#') && t.length > 2;
}
