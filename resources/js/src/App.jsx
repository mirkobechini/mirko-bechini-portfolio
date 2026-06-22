/* React & Libraries */
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

/* Components */
import DefaultLayout from './components/layout/DefaultLayout';

/* Context */
import { GlobalContextProvider } from './context/GlobalContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const PageLoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} />
);

function App() {


  return (
    <>
      <GlobalContextProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              <Route element={<DefaultLayout />}>
                <Route index element={<HomePage />} />
                <Route path="*" element={<h1>404 Not Found</h1>} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </GlobalContextProvider>
    </>
  )
}

export default App
