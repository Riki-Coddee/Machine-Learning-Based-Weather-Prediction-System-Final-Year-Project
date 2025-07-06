import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Share2, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState([]);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/admin/news/${id}`);
        setNewsItem({
          ...response.data,
          date: new Date(response.data.date)
        });

        // Fetch related news (same category)
        const relatedResponse = await axios.get(`http://localhost:5000/api/admin/news?category=${response.data.category}&limit=3`);
        setRelatedNews(relatedResponse.data.filter(item => item._id !== id).slice(0, 3));
      } catch (error) {
        console.error('Error fetching news detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"
          ></motion.div>
          <p className="mt-4 text-gray-600 text-lg">Loading news article...</p>
        </div>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Article not found</h2>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-500 hover:text-blue-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to News
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden"
        >
          {/* Featured Image */}
          <div className="relative h-96 w-full overflow-hidden">
            <img
              src={`http://localhost:5000/${newsItem.image}`}
              alt={newsItem.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/default-news-large.jpg";
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <div className="flex items-center justify-between">
                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {newsItem.category}
                </span>
                <div className="flex space-x-3">
                  <button className="text-white hover:text-blue-300 transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button className="text-white hover:text-blue-300 transition-colors">
                    <Bookmark className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="p-8">
            <div className="flex items-center text-gray-500 mb-4">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{moment(newsItem.date).format("MMMM D, YYYY")}</span>
              <span className="mx-2">•</span>
              <Clock className="h-4 w-4 mr-2" />
              <span>{Math.ceil(newsItem.content.split(' ').length / 200)} min read</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {newsItem.title}
            </h1>

            <div className="prose max-w-none text-gray-700">
              {newsItem.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </div>
        </motion.article>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Related News</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedNews.map(item => (
                <motion.div 
                  key={item._id}
                  whileHover={{ y: -5 }}
                  onClick={() => navigate(`/news/${item._id}`)}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg"
                >
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={`http://localhost:5000/${item.image}`}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {item.category}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">
                      {item.content.substring(0, 100)}...
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Weather News Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default NewsDetail;