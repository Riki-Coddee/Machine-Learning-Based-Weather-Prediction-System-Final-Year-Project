// src/pages/AdminFeedback.jsx
import { useState, useEffect } from "react";
import {
  Mail,
  User,
  MessageSquare,
  Clock,
  ArrowLeft,
  Filter,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const query = statusFilter !== "all" ? `status=${statusFilter}&` : "";
      const url = `http://localhost:5000/api/admin/feedback?${query}page=${pagination.page}&limit=${pagination.limit}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch feedback");

      const data = await response.json();
      setFeedbacks(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/feedback/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) throw new Error("Failed to update status");
      fetchFeedbacks();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const deleteFeedback = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/delete/feedback/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete feedback");
      fetchFeedbacks();
      toast.success("Feedback deleted successfully.");
    } catch (err) {
      console.error("Error deleting feedback:", err);
      alert("Failed to delete feedback");
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [statusFilter, pagination.page]);

  if (loading)
    return <div className="p-8 text-center">Loading feedback...</div>;
  if (error)
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">User Feedback</h1>
              <p className="opacity-90">
                All submitted user feedback and inquiries
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md px-3 py-1 text-orange-400"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="archived">Archived</option>
              </select>
              <button
                onClick={fetchFeedbacks}
                className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedbacks.map((feedback) => (
                <tr key={feedback.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-500" />
                      <span>{feedback.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <MessageSquare className="h-5 w-5 mr-2 text-green-500 mt-1 flex-shrink-0" />
                      <p className="line-clamp-2">{feedback.message}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={`mailto:${feedback.email}`}
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <Mail className="h-5 w-5 mr-2" />
                      {feedback.email}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-gray-500" />
                      {new Date(feedback.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold leading-5  ${
                        feedback.status === "new"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : feedback.status === "reviewed"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-gray-100 text-gray-800 border border-gray-200"
                      }`}
                    >
                      {feedback.status.charAt(0).toUpperCase() +
                        feedback.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-2">
                    <select
                      value={feedback.status}
                      onChange={(e) =>
                        updateStatus(feedback.id, e.target.value)
                      }
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="archived">Archived</option>
                    </select>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this feedback?"
                          )
                        ) {
                          deleteFeedback(feedback.id);
                        }
                      }}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete feedback"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}
                </span>{" "}
                of <span className="font-medium">{pagination.total}</span>{" "}
                feedbacks
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    page: Math.max(1, pagination.page - 1),
                  })
                }
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded-md text-sm font-medium disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page + 1 })
                }
                disabled={
                  pagination.page * pagination.limit >= pagination.total
                }
                className="px-3 py-1 border rounded-md text-sm font-medium disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedback;
