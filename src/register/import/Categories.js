// Categories.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LinkIcon,
  Check,
  Tag,
  DollarSign,
  Info,
  X,
  Loader2,
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import Header from '../../components/backToPreviousHeader';
import Loading from '../../components/LoadingSpinner';
import axios from 'axios';

const LoadingSpinner = () => (
  <Loading />
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
        <div className="relative w-full max-w-md mx-4 my-6 z-50" onClick={(e) => e.stopPropagation()}>
          <div className="relative flex flex-col w-full bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-blue-950">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative p-6 text-gray-700 leading-relaxed">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

const Categories = () => {
  const { user } = useUser();
  
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, selectedWebsites, preselectedCategoryId } = location.state || {};
  const [categoriesByWebsite, setCategoriesByWebsite] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [error, setError] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // const adOwnerEmail = user.primaryEmailAddress.emailAddress;

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const promises = selectedWebsites.map(async (websiteId) => {
          const websiteResponse = await fetch(`http://localhost:5000/api/websites/website/${websiteId}`);
          const websiteData = await websiteResponse.json();
          const categoriesResponse = await fetch(`http://localhost:5000/api/ad-categories/${websiteId}/advertiser`);
          const categoriesData = await categoriesResponse.json();

          return {
            websiteName: websiteData.websiteName || 'Unknown Website',
            websiteLink: websiteData.websiteLink || '#',
            categories: categoriesData.categories || [],
          };
        });
        const result = await Promise.all(promises);
        setCategoriesByWebsite(result);
        
        // If there's a preselected category, select it automatically
        if (preselectedCategoryId) {
          setSelectedCategories([preselectedCategoryId]);
          
          // Get category description for display
          for (const websiteData of result) {
            const foundCategory = websiteData.categories.find(
              cat => cat._id === preselectedCategoryId
            );
            
            if (foundCategory) {
              setSelectedDescription(foundCategory.description);
              
              // If preselection is complete, automatically navigate to the next step
              setTimeout(() => {
                navigate('/select', {
                  state: {
                    userId,
                    selectedWebsites,
                    selectedCategories: [preselectedCategoryId]
                  }
                });
              }, 500);
              
              break;
            }
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setIsLoading(false);
      }
    };

    if (selectedWebsites && selectedWebsites.length > 0) {
      fetchCategories();
    } else {
      setIsLoading(false);
    }
  }, [selectedWebsites, preselectedCategoryId, userId, navigate]);

  const handleCategorySelection = (categoryId) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(categoryId) 
        ? prevSelected.filter((id) => id !== categoryId) 
        : [...prevSelected, categoryId]
    );
    setError(false);
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (selectedCategories.length === 0) {
      setError('Please select at least one category');
      return;
    }

    navigate('/select', {
      state: {
        // adOwnerEmail,
        userId,
        selectedWebsites,
        selectedCategories
      }
    });
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl text-blue-950 font-bold">
                Select Categories
              </h1>
              <p className="text-gray-600">
                Choose relevant categories for your advertisement
              </p>
            </div>
            <button 
              onClick={handleNext}
              className={`w-full sm:w-auto mt-6 sm:mt-0 flex items-center justify-center px-6 py-3 rounded-lg font-bold text-white sm:text-base transition-all duration-300 ${
                selectedCategories.length === 0 
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#FF4500] hover:bg-orange-500 hover:-translate-y-0.5'
              }`}
            >
              Next
            </button>
          </div>

          {error && (
            <div className="mx-8 my-6 flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
              <Info className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Please select at least one category to proceed</span>
            </div>
          )}

          <div className="p-8">
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <LoadingSpinner />
              </div>
            ) : categoriesByWebsite.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {categoriesByWebsite.map((website) => (
                  <div 
                    key={website.websiteName} 
                    className="flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden transition-shadow duration-300 hover:shadow-lg"
                  >
                    <div className="bg-gradient-to-r from-gray-50 to-white p-4 flex justify-between items-center border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-blue-950">{website.websiteName}</h2>
                      <a 
                        href={website.websiteLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <LinkIcon className="w-5 h-5" />
                      </a>
                    </div>
                    
                    {website.categories.length > 0 ? (
                      <div className="p-6 grid gap-4">
                        {website.categories.map((category) => (
                          <div
                            key={category._id}
                            onClick={() => 
                              !category.isFullyBooked && handleCategorySelection(category._id)
                            }
                            className={`group relative flex flex-col bg-white rounded-xl p-5 border-2 transition-all duration-300 ${
                              category.isFullyBooked 
                                ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                                : 'cursor-pointer hover:shadow-lg'
                            } ${
                              selectedCategories.includes(category._id)
                                ? 'border-[#FF4500] bg-red-50/50 scale-[1.02]'
                                : 'border-gray-200'
                            }`}
                          >
                            {category.isFullyBooked && (
                              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                Fully Booked
                              </div>
                            )}
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <Tag className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-blue-950">
                                  {category.categoryName}
                                </h3>
                              </div>
                              {selectedCategories.includes(category._id) && (
                                <div className="p-1 bg-blue-500 rounded-full">
                                  <Check size={16} className="text-white" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-start gap-2 mb-4">
                              <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                                {category.description}
                              </p>
                              {category.description.length > 100 && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDescription(category.description);
                                  }}
                                  className="flex-shrink-0 p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Info className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                              <span className="text-sm font-medium text-green-600">RWF</span>
                              <span className="text-lg font-semibold text-blue-950">{category.price}</span>
                              {category.isFullyBooked && (
                                <span className="ml-2 text-sm text-red-500">(Space Full)</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center text-gray-500">
                        <p className="font-medium">No categories available</p>
                        <p className="text-sm text-gray-400 mt-1">Check back later for updates</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg font-medium text-gray-600">No categories available</p>
                <p className="text-sm text-gray-500 mt-1">Please select different websites and try again</p>
              </div>
            )}
          </div>
        </div>

        <Modal 
          isOpen={!!selectedDescription} 
          onClose={() => setSelectedDescription(null)}
          title="Category Description"
        >
          <p className="text-gray-700 leading-relaxed">{selectedDescription}</p>
        </Modal>
      </div>
    </div>
  );
};

export default Categories;