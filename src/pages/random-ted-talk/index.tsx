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

const parser = new DOMParser();
async function getRandomTedTalk() {
  const page = _.random(1, 157);

  const pageUrl = `https://www.ted.com/talks/quick-list?page=${page}`;
  const { contents: content } = await get(pageUrl).then((res) => res.json());

  const doc = parser.parseFromString(content, 'text/html');
  const list = doc.querySelector('div.row.quick-list__container');

  if (!list) {
    alert('List is empty');
    return;
  }

  const items = Array.from(list.children);
  const random = _.shuffle(items)[0];

  const aTag = random.querySelector('a');

  if (!aTag) {
    alert('A tag not found');
    return;
  }

  const url = `https://www.ted.com/talks/${aTag.href.split('/talks/')[1]}`;
  const title = aTag.innerText;

  const { contents: talkContent } = await get(url).then((res) => res.json());

  const talkDoc = parser.parseFromString(talkContent, 'text/html');

  const metaTags = Array.from(talkDoc.querySelectorAll('meta'));
  const image = metaTags.find(
    (i) => 'og:image' === (i.getAttribute('property') || '')
  )?.content as string;

  const description = metaTags.find(
    (i) => 'og:description' === (i.getAttribute('property') || '')
  )?.content as string;

  return { image, url, title, description };
}

type RandomTedTalkProps = {};

export const RandomTedTalk = (props: RandomTedTalkProps) => {
  const [random, setRandom] = useState<TedTalkType>();

  useEffect(() => {
    getRandomTedTalk().then(setRandom);
  }, []);

  if (!random) {
    return <div>Loading...</div>;
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
