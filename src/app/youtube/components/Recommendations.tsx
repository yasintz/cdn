import ImageCard from './ImageCard';
import { generate } from 'random-words';
import { toast } from 'sonner';

const word = generate() as string;

const Recommendations = () => {
  return (
    <div className="flex gap-8 p-8">
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
        description="Buyuk seyler kucuk adimlar ile basirilir"
        text="Ogren"
        to={`https://dictionary.cambridge.org/dictionary/english/${word}`}
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
    </div>
  );
};

export default Recommendations;
