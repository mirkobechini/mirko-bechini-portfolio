import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock all dependencies
vi.mock('../pages/HomePage', () => ({
    default: () => <div data-testid="home-page">Home Page</div>,
}));
vi.mock('../pages/NotFoundPage', () => ({
    default: () => <div data-testid="not-found-page">404 Not Found</div>,
}));
vi.mock('../components/layout/DefaultLayout', () => ({
    default: ({ children }) => <div data-testid="default-layout">{children}</div>,
}));
vi.mock('../context/GlobalContext', () => ({
    GlobalContextProvider: ({ children }) => <div data-testid="global-context">{children}</div>,
    default: {},
}));
vi.mock('react-router-dom', () => {
    const MockOutlet = () => <div data-testid="outlet" />;
    const MockBrowserRouter = ({ children }) => <div data-testid="browser-router">{children}</div>;
    const MockRoutes = ({ children }) => <div data-testid="routes">{children}</div>;
    const MockRoute = ({ element }) => element;
    return {
        BrowserRouter: MockBrowserRouter,
        Routes: MockRoutes,
        Route: MockRoute,
        Outlet: MockOutlet,
    };
});

import App from '../App';

describe('App', () => {
    it('renders GlobalContextProvider', () => {
        render(<App />);
        expect(screen.getByTestId('global-context')).toBeInTheDocument();
    });

    it('renders BrowserRouter', () => {
        render(<App />);
        expect(screen.getByTestId('browser-router')).toBeInTheDocument();
    });

    it('renders DefaultLayout via Route', () => {
        render(<App />);
        expect(screen.getByTestId('default-layout')).toBeInTheDocument();
    });
});