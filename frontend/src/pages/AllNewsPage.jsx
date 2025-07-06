import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Calendar, 
  Search, 
  Filter,
  Bookmark,
  Share2,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";

const AllNewsPage = () => {
  const [newsData, setNewsData] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isBookmarked, setIsBookmarked] = useState({});
  const navigate = useNavigate();

  // Enhanced theme with gradient options
  const theme = {
    bgGradient: "bg-gradient-to-br from-indigo-50 to-blue-100",
    cardGradient: "bg-gradient-to-br from-white to-blue-50",
    text: "text-gray-800",
    accent: "bg-blue-500",
    button: "bg-blue-600 hover:bg-blue-700",
    border: "border-blue-200",
    tag: "bg-blue-100 text-blue-800",
    icon: "text-blue-600"
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/news');
        const formattedNews = response.data.map(newsItem => ({
          id: newsItem.id,
          title: newsItem.title,
          content: newsItem.content,
          category: newsItem.category || "General",
          image: newsItem.image,
          date: new Date(newsItem.date),
          readTime: Math.max(3, Math.floor(newsItem.content.length / 500)) // 500 chars = ~1 min
        }));
        
        setNewsData(formattedNews);
        setFilteredNews(formattedNews);
        
        // Initialize bookmark state
        const initialBookmarks = {};
        formattedNews.forEach(item => {
          initialBookmarks[item.id] = false;
        });
        setIsBookmarked(initialBookmarks);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Search and filter function
  useEffect(() => {
    const filterNews = () => {
      let results = newsData;
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        results = results.filter(news => 
          news.title.toLowerCase().includes(term) || 
          news.content.toLowerCase().includes(term) ||
          news.category.toLowerCase().includes(term)
        );
      }
      
      if (selectedCategory !== "All") {
        results = results.filter(news => news.category === selectedCategory);
      }
      
      setFilteredNews(results);
    };

    filterNews();
  }, [searchTerm, selectedCategory, newsData]);

  const toggleBookmark = (id) => {
    setIsBookmarked(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleReadMore = (id) => {
    navigate(`/news/${id}`);
  };

  const categories = ["All", ...new Set(newsData.map(item => item.category))];

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.bgGradient} flex items-center justify-center`}>
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut"
          }}
          className="rounded-full h-20 w-20 border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent"
        ></motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bgGradient} ${theme.text}`}>
      {/* Sticky Header with Glass Morphism Effect */}
      <header className={`sticky top-0 z-50 py-4 px-6 backdrop-blur-lg bg-white/80 shadow-sm ${theme.border} border-b`}>
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <motion.button 
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className={`${theme.button} px-4 py-2 rounded-full font-medium flex items-center text-white shadow-md`}
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back
            </motion.button>
            
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              Weather News Hub
            </motion.h1>
            
            <div className="w-28"></div>
          </div>
        </div>
      </header>

      {/* Advanced Search and Filter Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${theme.cardGradient} p-6 rounded-2xl shadow-xl ${theme.border} border`}
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Search Input with Micro-interactions */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="relative"
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className={`h-5 w-5 ${theme.icon}`} />
                </div>
                <input
                  type="text"
                  placeholder="Search news by title, content or category..."
                  className={`pl-10 w-full p-3 rounded-xl ${theme.border} border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <span className="text-gray-400 hover:text-gray-600">×</span>
                  </motion.button>
                )}
              </motion.div>

              {/* Category Filter with Fancy Dropdown */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="relative"
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className={`h-5 w-5 ${theme.icon}`} />
                </div>
                <select
                  className={`pl-10 w-full p-3 rounded-xl ${theme.border} border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer`}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option 
                      key={category} 
                      value={category}
                      className="hover:bg-blue-100"
                    >
                      {category}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </motion.div>
            </div>

            {/* Results Count */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex justify-between items-center"
            >
              <p className="text-sm text-gray-600">
                Showing {filteredNews.length} of {newsData.length} articles
              </p>
              {searchTerm && (
                <button 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* News Grid with Staggered Animations */}
      <section className="py-8 px-4 pb-16">
        <div className="container mx-auto max-w-7xl">
          <AnimatePresence>
            {filteredNews.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                <div className="inline-block p-6 rounded-full bg-blue-50 mb-4">
                  <Search className={`h-12 w-12 ${theme.icon}`} />
                </div>
                <h3 className="text-2xl font-bold mb-2">No news found</h3>
                <p className="opacity-80 mb-4">Try adjusting your search or filters</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                  }}
                  className={`${theme.button} px-6 py-2 rounded-full text-white font-medium`}
                >
                  Reset filters
                </button>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredNews.map((newsItem, index) => (
                  <motion.div
                    key={newsItem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                    className={`${theme.cardGradient} rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${theme.border} border group`}
                  >
                    {/* Image with Overlay */}
                    <div className="h-64 relative overflow-hidden">
                      <motion.img
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        src={`http://localhost:5000/${newsItem.image}`}
                        alt={newsItem.title}
                        className="w-full h-full object-cover transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = "/images/default-news.jpg";
                        }}
                      />
                      
                      {/* Category Tag */}
                      <div className={`absolute top-4 left-4 ${theme.tag} text-xs font-bold px-3 py-1 rounded-full shadow`}>
                        {newsItem.category}
                      </div>
                      
                      {/* Bookmark Button */}
                      <button
                        onClick={() => toggleBookmark(newsItem.id)}
                        className={`absolute top-4 right-4 p-2 rounded-full ${isBookmarked[newsItem.id] ? 'bg-yellow-400 text-yellow-800' : 'bg-white/90 text-gray-600'} shadow-md hover:bg-yellow-100 transition-colors`}
                      >
                        <Bookmark className="h-4 w-4" fill={isBookmarked[newsItem.id] ? "currentColor" : "none"} />
                      </button>
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                      
                      {/* Title Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-xl font-bold text-white line-clamp-2">
                          {newsItem.title}
                        </h3>
                        <div className="flex items-center text-white/80 text-sm mt-2 space-x-4">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {moment(newsItem.date).format("MMM D, YYYY")}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {newsItem.readTime} min read
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <p className="text-gray-700 mb-4 line-clamp-3">
                        {newsItem.content}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => handleReadMore(newsItem.id)}
                          className={`${theme.button} px-5 py-2 rounded-full font-medium flex items-center text-white shadow-md hover:shadow-lg transition-all`}
                        >
                          Read Full Story
                        </button>
                        
                        <button className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Share2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-8 right-8 ${theme.button} p-4 rounded-full shadow-xl text-white`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </motion.button>
    </div>
  );
};

export default AllNewsPage;