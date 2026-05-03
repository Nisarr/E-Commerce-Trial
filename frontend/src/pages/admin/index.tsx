import React, { useState, useEffect } from 'react';
import { getProducts, getCategories, getBanners, createBanner, updateBanner, deleteBanner, createProduct, updateProduct, deleteProduct, createCategory, updateCategory, deleteCategory } from '../../services/api';
import type { Product, Category, Banner } from '../../types';
import { Sidebar } from './Sidebar';
import { AdminNavbar } from './AdminNavbar';
import { BannerManager } from './BannerManager';
import { CategoryManager } from './CategoryManager';
import { ProductManager } from './ProductManager';
import { OrderManager } from './OrderManager';
import { AdminSettings } from './Settings';
import { AdminLogin } from './Login';
import { AdminDashboard } from './Dashboard';
import { useAuthStore } from '../../store/authStore';
import { BannerModal } from '../../components/admin/BannerModal';
import { ProductModal } from '../../components/admin/ProductModal';
import { CategoryModal } from '../../components/admin/CategoryModal';

export const AdminIndex: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const [activeTab, setActiveTab] = useState<string>('dashboard');
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const fetchData = async () => {
    try {
      const [banners, categories, productsResponse] = await Promise.all([
        getBanners(),
        getCategories(false, true),
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

  const handleSaveCategory = async (categoryData: Partial<Category>) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
      } else {
        await createCategory(categoryData);
      }
      await fetchData();
    } catch (error) {
      console.error('Save category failed:', error);
      alert('Failed to save category');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await deleteBanner(id);
      await fetchData();
    } catch (error) {
      alert('Failed to delete banner');
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

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      await fetchData();
    } catch (error) {
      alert('Failed to delete category');
    }
  };

  const openAddModal = () => {
    setEditingBanner(null);
    setEditingProduct(null);
    setEditingCategory(null);
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

  const openEditCategoryModal = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  if (!isAdmin) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-[#f4f7fa] flex font-['Outfit',sans-serif]">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      <div className="flex-grow flex flex-col min-w-0">
        <AdminNavbar 
          onAdd={['banners', 'categories', 'products'].includes(activeTab) ? openAddModal : undefined}
          addLabel={
            activeTab === 'banners' ? 'Add Banner' :
            activeTab === 'categories' ? 'Add Category' :
            activeTab === 'products' ? 'Add Product' : undefined
          }
        />

        <main className="flex-grow py-8 px-12 overflow-y-auto overflow-x-hidden">
          {loading ? (
            <div className="w-full max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-40 bg-gray-200/50 rounded-[2rem] animate-pulse" />
                ))}
              </div>
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="h-8 bg-gray-200/50 w-1/4 rounded-lg animate-pulse" />
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-20 bg-gray-100/50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1600px] mx-auto w-full">
              {activeTab === 'dashboard' && (
                <AdminDashboard 
                  stats={{
                    products: data.products.length,
                    categories: data.categories.length,
                    banners: data.banners.length
                  }} 
                />
              )}
              {activeTab === 'banners' && (
                <BannerManager 
                  banners={data.banners} 
                  onEdit={openEditBannerModal}
                  onDelete={handleDeleteBanner}
                />
              )}
              {activeTab === 'categories' && (
                <CategoryManager 
                  categories={data.categories} 
                  products={data.products}
                  onEdit={openEditCategoryModal}
                  onDelete={handleDeleteCategory}
                />
              )}
              {activeTab === 'products' && (
                <ProductManager 
                  products={data.products} 
                  onEdit={openEditProductModal}
                  onDelete={handleDeleteProduct}
                />
              )}
              {activeTab === 'orders' && (
                <OrderManager />
              )}
              {activeTab === 'settings' && <AdminSettings />}
            </div>
          )}
        </main>
      </div>

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

      {isModalOpen && activeTab === 'categories' && (
        <CategoryModal 
          category={editingCategory}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCategory}
        />
      )}
    </div>
  );
};
