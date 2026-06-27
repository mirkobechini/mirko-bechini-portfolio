/* React & Libraries */
import { BrowserRouter, Route, Routes } from 'react-router-dom';

/* Components */
import DefaultLayout from './components/layout/DefaultLayout';
import HomePage from './pages/HomePage';

/* Context */
import { GlobalContextProvider } from './context/GlobalContext';

function App() {
  return (
    <>
      <GlobalContextProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<DefaultLayout />}>
              <Route index element={<HomePage />} />
              <Route path="*" element={<h1>404 Not Found</h1>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </GlobalContextProvider>
    </>
  )
}

export default App
