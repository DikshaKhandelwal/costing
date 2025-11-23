import { useState } from 'react';
import { Database as DatabaseIcon } from 'lucide-react';
import ProductsList from './pages/ProductsList';
import ProductEditor from './pages/ProductEditor';
import MaterialMaster from './components/MaterialMaster';
import LandingPage from './pages/LandingPage';
import bannerImage from './lib/banner.png';

type View = 'landing' | 'products' | 'editor' | 'materials';

function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();

  function handleEnterApp() {
    setCurrentView('products');
  }

  function handleCreateNew() {
    setSelectedProductId(undefined);
    setCurrentView('editor');
  }

  function handleViewProduct(productId: string) {
    setSelectedProductId(productId);
    setCurrentView('editor');
  }

  function handleBackToProducts() {
    setSelectedProductId(undefined);
    setCurrentView('products');
  }

  // Show landing page
  if (currentView === 'landing') {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="bg-stone-900 shadow-lg border-b-4 border-stone-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={bannerImage} 
                alt="WoodCurls Logo" 
                className="h-16 w-auto object-contain rounded-lg shadow-md bg-white/10 p-2"
              />
              <div>
                <h1 className="text-4xl font-bold text-stone-50 tracking-wide">WoodCurls</h1>
                <p className="text-lg text-stone-300 font-medium">Premium Furniture Costing System</p>
              </div>
            </div>

            <nav className="flex gap-3">
              <button
                onClick={() => setCurrentView('products')}
                className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all ${
                  currentView === 'products' || currentView === 'editor'
                    ? 'bg-stone-700 text-white shadow-lg scale-105'
                    : 'bg-stone-200 text-stone-900 hover:bg-stone-300'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setCurrentView('materials')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-lg transition-all ${
                  currentView === 'materials'
                    ? 'bg-stone-700 text-white shadow-lg scale-105'
                    : 'bg-stone-200 text-stone-900 hover:bg-stone-300'
                }`}
              >
                <DatabaseIcon className="w-5 h-5" />
                Materials
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {currentView === 'products' && (
          <ProductsList
            onCreateNew={handleCreateNew}
            onViewProduct={handleViewProduct}
          />
        )}

        {currentView === 'editor' && (
          <ProductEditor
            productId={selectedProductId}
            onBack={handleBackToProducts}
          />
        )}

        {currentView === 'materials' && <MaterialMaster />}
      </main>

      <footer className="bg-stone-900 border-t-4 border-stone-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-lg text-stone-300 font-medium">
            🪑 WoodCurls Furniture Costing & Estimation System - Professional Manufacturing Cost Calculator 🪵
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
