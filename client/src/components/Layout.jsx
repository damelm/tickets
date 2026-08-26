import { NavBar } from './NavBar.jsx';

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-page">
      <NavBar />
      {children}
    </div>
  );
}
