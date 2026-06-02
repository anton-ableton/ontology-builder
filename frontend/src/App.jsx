import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import { AppRoute } from './const';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={AppRoute.MAIN} element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
