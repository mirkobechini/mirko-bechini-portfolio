import { BrowserRouter, Route, Routes } from "react-router-dom"
import GlobalContext from "./context/GlobalContext"
import DefaultLayout from "./components/layout/DefaultLayout"
import HomePage from "./pages/HomePage"

function App() {
 

  return (
    <>
      <GlobalContext.Provider >
        <BrowserRouter>
          <Routes>
            <Route element={<DefaultLayout/>}>
              <Route index element={<HomePage />} />
              <Route path="*" element={<h1>404 Not Found</h1>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </GlobalContext.Provider>
    </>
  )
}

export default App
