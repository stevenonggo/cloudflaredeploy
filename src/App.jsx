import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import StarterSelect from './pages/StarterSelect';
import Game from './pages/Game';
import Battle from './pages/Battle';
import Party from './pages/Party';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/starter" element={<StarterSelect />} />
      <Route path="/game" element={<Game />} />
      <Route path="/battle" element={<Battle />} />
      <Route path="/party" element={<Party />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
