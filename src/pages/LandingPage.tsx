import { ArrowRight, Package, Database, Calculator, FileText } from 'lucide-react';
import bannerImage from '../lib/banner.png';

interface LandingPageProps {
  onEnterApp: () => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-stone-100">
      {/* Hero Section */}
      <div 
        className="relative text-white bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${bannerImage})`,
          minHeight: '600px'
        }}
      >
        {/* Optional subtle overlay for text readability - can be removed if not needed */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-7xl font-bold mb-8 tracking-wide drop-shadow-2xl">
              Welcome to WoodCurls
            </h1>
            <p className="text-3xl text-white mb-8 max-w-3xl mx-auto drop-shadow-lg">
              Professional Furniture Costing & Estimation System
            </p>
            <p className="text-2xl text-white mb-12 max-w-2xl mx-auto drop-shadow-lg">
              Streamline your furniture manufacturing costs with precision calculations, 
              material management, and detailed cost breakdowns.
            </p>
            <button
              onClick={onEnterApp}
              className="inline-flex items-center gap-3 px-12 py-6 bg-stone-800 text-white text-2xl font-bold rounded-xl hover:bg-stone-900 transition-all shadow-2xl transform hover:scale-105"
            >
              Enter Application
              <ArrowRight className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-stone-900 text-center mb-16">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-stone-300 p-8 text-center">
            <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-stone-800" />
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-4">
              Product Management
            </h3>
            <p className="text-lg text-stone-700">
              Create and manage furniture products with detailed specifications and dimensions
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border-2 border-stone-300 p-8 text-center">
            <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Database className="w-8 h-8 text-stone-800" />
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-4">
              Material Master
            </h3>
            <p className="text-lg text-stone-700">
              Maintain a comprehensive database of materials with current pricing per CFT
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border-2 border-stone-300 p-8 text-center">
            <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calculator className="w-8 h-8 text-stone-800" />
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-4">
              Cost Calculation
            </h3>
            <p className="text-lg text-stone-700">
              Automatic calculations including labor, materials, hardware, and profit margins
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border-2 border-stone-300 p-8 text-center">
            <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-stone-800" />
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-4">
              Export Reports
            </h3>
            <p className="text-lg text-stone-700">
              Generate professional cost estimates and reports for your clients
            </p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-stone-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Built for Furniture Manufacturers
          </h2>
          <p className="text-xl text-stone-200 mb-8">
            WoodCurls helps furniture makers accurately estimate production costs, 
            manage material inventories, and generate professional quotations. 
            Our system handles complex calculations including cubic feet conversions, 
            multiple cost factors, and automatic margin calculations.
          </p>
          <button
            onClick={onEnterApp}
            className="inline-flex items-center gap-3 px-10 py-5 bg-stone-700 text-white text-xl font-bold rounded-xl hover:bg-stone-900 transition-all shadow-2xl"
          >
            Get Started Now
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-stone-900 border-t-4 border-stone-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-lg text-stone-300 font-medium">
            🪑 WoodCurls Furniture Costing & Estimation System - Professional Manufacturing Cost Calculator 🪵
          </p>
        </div>
      </footer>
    </div>
  );
}
