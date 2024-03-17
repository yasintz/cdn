import ImageCard from './ImageCard';
import { generate } from 'random-words';
import { useState } from 'react';
import { toast } from 'sonner';

// const word = generate() as string;

const Recommendations = () => {
  const [word, setWord] = useState(generate() as string);
  return (
    <div className="flex gap-8 mt-8 flex-wrap">
      <ImageCard
        title="Podcast Dinle"
        image="https://cdn.dribbble.com/users/730703/screenshots/11076980/media/f092bb64b0c5458e962cddfa9d3ff272.jpg"
        description="5 dakika bir cok seyi degistirebilir."
        text="Dinle"
        to="https://podcasts.google.com/subscriptions"
      />
      <ImageCard
        title="Yeni Bir Kelime Ogren"
        image="https://img.freepik.com/free-vector/hand-drawn-sustainable-travel-illustration_52683-148456.jpg?w=1060&t=st=1710570244~exp=1710570844~hmac=b017bf4439f717d98e9c2eec53097b958ea9981656bd93e78488df3dec78f22c"
        text="Degistir"
        description={
          <>
            Buyuk seyler kucuk adimlar ile basirilir.{' '}
            <a
              className="text-blue-500 underline"
              href={`https://dictionary.cambridge.org/dictionary/english/${word}`}
            >
              <span className="font-bold">{word}</span>
            </a>
          </>
        }
        onClick={() => setWord(generate() as string)}
      />
      <ImageCard
        title="Dizi Yada Film Izle"
        image="https://img.freepik.com/premium-vector/movie-characters-man-woman-romantic-screenplay-love-story-cinema-film-script-strip-oscar-award-best-cinematography-entertainment-concept-vector-illustration_140689-4382.jpg"
        description="Kolay ve eglenceli"
        text="Izle"
        to="https://www.imdb.com/user/ur125081890/watchlist"
      />
      <ImageCard
        title="Voscreen | Woodpecker"
        image="https://static.vecteezy.com/system/resources/previews/000/163/072/original/video-creator-illustration-vector.jpg"
        description="Illa video izlerim dersen."
        text="Ipadi Ac"
        onClick={() => toast("Ipad'i acman gerekiyor. Hement yanibasinda")}
      />
      <ImageCard
        title="Ted Talks"
        image="https://snov.io/blog/wp-content/uploads/2021/03/80XkAlRC0rn99aIBVxcbXpLrzAUCqne3KfLHoolm-min-1536x768.png"
        description="Baska bir video izleme yolu."
        text="Izle"
        to="https://www.ted.com/talks"
      />
    </div>
  );
};

export default Recommendations;
