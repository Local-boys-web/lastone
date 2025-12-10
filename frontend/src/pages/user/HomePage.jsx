import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';
import JobCard from '../../components/common/JobCard';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import '../../styles/HomePage.css';

const HomePage = () => {
  const { isAuthenticated, userType, user, logout } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    category: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [filters, currentPage]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await jobService.getAllJobs({
        ...filters,
        page: currentPage,
        limit: 12
      });
      setJobs(data.jobs);
      setTotalPages(data.pages);
    } catch (err) {
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const sidebarLinks = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/user/profile', label: 'Profile', icon: '👤' },
    { label: 'Logout', icon: '🚪', onClick: handleLogout },
  ];

  return (
    <>
      <Navbar
        onSidebarToggle={toggleSidebar}
        showSidebarToggle={isAuthenticated && userType === 'user'}
      />

      {/* Sidebar for logged-in users */}
      {isAuthenticated && userType === 'user' && (
        <Sidebar
          links={sidebarLinks}
          userType="User"
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
        />
      )}

      <div className={`homepage ${isAuthenticated && userType === 'user' && isSidebarOpen ? 'with-sidebar' : ''}`}>
        <section className="hero-section">
          <div className="hero-content">
            <h1>Hunt your perfect job</h1>
            <p>Your career starts with the right hunt.</p>
          </div>
        </section>

        <div className="container">
          {/* Search and Filter Section */}
          <div className="filter-section">
            <form onSubmit={handleSearch} className="filter-form">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search jobs by title or description..."
                className="search-input"
              />

              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Categories</option>
                <option value="Private">Private</option>
                <option value="Government">Government</option>
                <option value="Internship">Internship</option>
              </select>

              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Location"
                className="filter-input"
              />

              <button type="submit" className="search-btn">Search</button>
            </form>
          </div>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          {/* Jobs Grid */}
          {loading ? (
            <Loading message="Loading jobs..." />
          ) : jobs.length === 0 ? (
            <div className="no-jobs">
              <p>No jobs found. Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div className="jobs-grid">
                {jobs.map(job => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HomePage;
