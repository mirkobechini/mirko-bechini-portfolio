/* React & Libraries */
import { createContext, useState } from 'react';


const GlobalContext = createContext();

export function GlobalContextProvider({ children }) {
    const [activeSection, setActiveSection] = useState(null);

    return (
        <GlobalContext.Provider value={{ activeSection, setActiveSection }}>
            {children}
        </GlobalContext.Provider>
    );
}

export default GlobalContext;