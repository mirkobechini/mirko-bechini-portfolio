/* React & Libraries */
import { createContext, useMemo, useState } from 'react';


const GlobalContext = createContext();

export function GlobalContextProvider({ children }) {
    const [activeSection, setActiveSection] = useState(null);
    const contextValue = useMemo(
        () => ({ activeSection, setActiveSection }),
        [activeSection]
    );

    return (
        <GlobalContext.Provider value={contextValue}>
            {children}
        </GlobalContext.Provider>
    );
}

export default GlobalContext;