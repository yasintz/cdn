import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';

const get = (url: string) =>
  fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);

type TedTalkType = {
  image: string;
  url: string;
  title: string;
  description: string;
};

const localStorageKey = 'RANDOM_TED_TALK';

const cache: Record<string, TedTalkType> = JSON.parse(
  localStorage.getItem(localStorageKey) || '{}'
);

const parser = new DOMParser();

async function getRandomList() {
  const page = _.random(1, 157);

  const pageUrl = `https://www.ted.com/talks/quick-list?page=${page}`;
  const { contents: content } = await get(pageUrl).then((res) => res.json());

  const doc = parser.parseFromString(content, 'text/html');
  const list =
    doc.querySelector('div.row.quick-list__container')?.children || [];

  const items = _.shuffle(Array.from(list))
    .slice(0, 5)
    .map(async (element) => {
      const aTag = element.querySelector('a') as HTMLAnchorElement;

      const url = `https://www.ted.com/talks/${aTag.href.split('/talks/')[1]}`;

      if (cache[url]) {
        return cache[url];
      }
      const title = aTag.innerText;

      const { contents: talkContent } = await get(url).then((res) =>
        res.json()
      );

      const talkDoc = parser.parseFromString(talkContent, 'text/html');

      const metaTags = Array.from(talkDoc.querySelectorAll('meta'));
      const image = metaTags.find(
        (i) => 'og:image' === (i.getAttribute('property') || '')
      )?.content as string;

      const description = metaTags.find(
        (i) => 'og:description' === (i.getAttribute('property') || '')
      )?.content as string;

      const result: TedTalkType = { image, url, title, description };
      cache[url] = result;
      return result;
    });

  items.forEach((item) => {
    item.then(() => {
      console.log('setting', cache);
      localStorage.setItem(localStorageKey, JSON.stringify(cache));
    });
  });

  return items;
}

async function getRandomTedTalk() {
  const randomItemFromCache = _.shuffle(Object.values(cache))[0];

  const listPromise = getRandomList();

  if (randomItemFromCache) {
    return randomItemFromCache;
  }

  return listPromise.then((res) => res[0]);
}

type RandomTedTalkProps = {};

export const RandomTedTalk = (props: RandomTedTalkProps) => {
  const [random, setRandom] = useState<TedTalkType>();

  useEffect(() => {
    getRandomTedTalk().then(setRandom);
  }, []);

  if (!random) {
    return null;
  }

  return (
    <StyledContainer href={random.url} target="_blank">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          getRandomTedTalk().then(setRandom);
        }}
      >
        Random
      </button>
      <img src={random.image} />
      <h1>{random.title}</h1>
      <p>{random.description}</p>
    </StyledContainer>
  );
};

const StyledContainer = styled.a`
  height: 100%;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: black;
  align-items: center;
  justify-content: center;
  max-width: 1200px;
  margin: auto;

  img {
    object-fit: cover;
    width: 100%;
    height: 600px;
    border-radius: 8px;
  }
  p {
    width: 80%;
    font-size: 24px;
  }
`;
