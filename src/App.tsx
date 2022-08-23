import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { RandomTedTalk } from './pages/random-ted-talk';
import { Timejs } from './timejs';

function App() {
  return (
    <BrowserRouter basename="cdn">
      <Routes>
        <Route path="/">
          <Route index element={<div>App</div>} />
          <Route path="teams" element={<div>Teams</div>} />
          <Route path="timejs" element={<Timejs />} />
          <Route path="random-ted-talk" element={<RandomTedTalk />} />
          <Route path="contact" element={<div>Contact</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
