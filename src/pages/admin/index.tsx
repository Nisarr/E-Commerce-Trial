import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { getProducts, getCategories, getBanners, createBanner, updateBanner, deleteBanner, createProduct, updateProduct, deleteProduct } from '../../services/api';
import type { Product, Category, Banner } from '../../types';
import { Sidebar } from './Sidebar';
import { BannerManager } from './BannerManager';
import { CategoryManager } from './CategoryManager';
import { ProductManager } from './ProductManager';
import { AdminSettings } from './Settings';
import { AdminLogin } from './Login';
import { useAuthStore } from '../../store/authStore';
import { BannerModal } from '../../components/admin/BannerModal';
import { ProductModal } from '../../components/admin/ProductModal';

export const AdminIndex: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const [activeTab, setActiveTab] = useState<'banners' | 'categories' | 'products' | 'dashboard' | 'settings'>('banners');
  const [data, setData] = useState<{
    banners: Banner[],
    categories: Category[],
    products: Product[]
  }>({
    banners: [],
    categories: [],
    products: []
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchData = async () => {
    try {
      const [banners, categories, productsResponse] = await Promise.all([
        getBanners(),
        getCategories(),
        getProducts({})
      ]);
      setData({
        banners: banners,
        categories: categories,
        products: productsResponse.items
      });

    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
  }, [isAdmin]);

  const handleSaveBanner = async (bannerData: Omit<Banner, 'id'>) => {
    if (editingBanner) {
      await updateBanner(editingBanner.id, bannerData);
    } else {
      await createBanner(bannerData);
    }
    await fetchData();
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await deleteBanner(id);
      await fetchData();
    } catch (error) {
      alert('Failed to delete banner');
    }
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }
      await fetchData();
    } catch (error) {
      console.error('Save product failed:', error);
      alert('Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      await fetchData();
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const openAddModal = () => {
    setEditingBanner(null);
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditBannerModal = (banner: Banner) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  if (!isAdmin) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      <main className="flex-grow p-8">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-primary capitalize">{activeTab} Management</h1>
            <p className="text-muted font-medium">Manage your website content and inventory</p>
          </div>
          <button 
            onClick={openAddModal}
            disabled={activeTab !== 'banners' && activeTab !== 'products'}
            className={`flex items-center gap-2 px-6 py-3 bg-white text-primary border-2 border-gray-100 rounded-xl font-bold transition-all shadow-sm ${ (activeTab === 'banners' || activeTab === 'products') ? 'hover:border-primary hover:shadow-md' : 'opacity-50 cursor-not-allowed'}`}
          >
            <Plus size={20} /> Add New
          </button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-muted font-bold">Loading data...</div>
        ) : (
          <>
            {activeTab === 'banners' && (
              <BannerManager 
                banners={data.banners} 
                onEdit={openEditBannerModal}
                onDelete={handleDeleteBanner}
              />
            )}
            {activeTab === 'categories' && <CategoryManager categories={data.categories} />}
            {activeTab === 'products' && (
              <ProductManager 
                products={data.products} 
                onEdit={openEditProductModal}
                onDelete={handleDeleteProduct}
              />
            )}
            {activeTab === 'settings' && <AdminSettings />}
          </>
        )}

        {isModalOpen && activeTab === 'banners' && (
          <BannerModal 
            banner={editingBanner}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveBanner}
          />
        )}

        {isModalOpen && activeTab === 'products' && (
          <ProductModal 
            product={editingProduct}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveProduct}
          />
        )}
      </main>
    </div>
  );
};
