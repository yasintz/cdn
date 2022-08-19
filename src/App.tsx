import { Route, Routes, Link, HashRouter } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="App">
      <div>
        <nav>
          <ul id="navigation">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/teams">About</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </nav>
      </div>
      <HashRouter>
        <Routes>
          <Route path="/">
            <Route index element={<div>App</div>} />
            <Route path="teams" element={<div>Teams</div>} />
            <Route path="contact" element={<div>Contact</div>} />
          </Route>
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
