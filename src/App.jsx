import { BrowserRouter, Route, Routes } from "react-router-dom"
import GlobalContext from "./context/GlobalContext"
import DefaultLayout from "./components/layout/DefaultLayout"
import HomePage from "./pages/HomePage"
import AboutMePage from "./pages/AboutMePage"
import FormationPage from "./pages/FormationPage"
import ExperiencePage from "./pages/ExperiencePage"
import ProjectsPage from "./pages/ProjectsPage"
import SkillsPage from "./pages/SkillsPage"
import ContactPage from "./pages/ContactPage"

function App() {
 

  return (
    <>
      <GlobalContext.Provider >
        <BrowserRouter>
          <Routes>
            <Route element={<DefaultLayout/>}>
              <Route index element={<HomePage />} />
              <Route path="/aboutme" element={<AboutMePage />} />
              <Route path="/formation" element={<FormationPage />} />
              <Route path="/experience" element={<ExperiencePage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/skills" element={<SkillsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<h1>404 Not Found</h1>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </GlobalContext.Provider>
    </>
  )
}

export default App
