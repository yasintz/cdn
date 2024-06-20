import _ from 'lodash';

export function parseTagsFromTitle(title: string) {
  return {
    title,
    tags: _.uniq(title.split(' ').filter(isTag)),
  };
}

export function isTag(t: string) {
  return t.startsWith('#') && t.length > 2;
}
