import MainLayout from './components/MainLayout';
import CustomCursor from './components/CustomCursor';

export default function App() {
  return (
    <div className="antialiased">
      <CustomCursor />
      <MainLayout />
    </div>
  );
}

