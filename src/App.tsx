import { Route, Routes, Link, BrowserRouter } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <BrowserRouter basename='cdn'>
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
        <Routes>
          <Route path="/">
            <Route index element={<div>App</div>} />
            <Route path="teams" element={<div>Teams</div>} />
            <Route path="contact" element={<div>Contact</div>} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
