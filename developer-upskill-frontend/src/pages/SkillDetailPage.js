import React, { useState, useEffect, useCallback, useMemo } from 'react'; // 1. Import useCallback
import { useParams, useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { apiClient, useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import ProgressBar from '../components/ProgressBar';
import CommentItem from '../components/CommentItem';
import StarRating from '../components/StarRating';

const SkillDetailPage = () => {
  const { id } = useParams();
  const [skill, setSkill] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate(); // 2. Initialize useNavigate
  
  const [comments, setComments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); 

  // --- 2. Wrap all data-fetching functions in useCallback ---
  const fetchComments = useCallback(async () => {
      try {
          const commentsRes = await apiClient.get(`/api/skills/${id}/comments/`);
          setComments(commentsRes.data);
      } catch (error) {
          console.error("Failed to fetch comments:", error);
      }
  }, [id]); // 3. Add `id` as dependency

  const fetchReviews = useCallback(async () => {
      try {
          const reviewsRes = await apiClient.get(`/api/skills/${id}/reviews/`);
          setReviews(reviewsRes.data);
      } catch (error) {
          console.error("Failed to fetch reviews:", error);
      }
  }, [id]); // 3. Add `id` as dependency

  const fetchSkillData = useCallback(async () => {
    setLoading(true);
    try {
      const skillRes = await apiClient.get(`/api/skills/${id}/`);
      setSkill(skillRes.data);
      if (user) {
        const enrollmentsRes = await apiClient.get('/api/enrollments/');
        const currentEnrollment = enrollmentsRes.data.find(e => e.skill.id === parseInt(id));
        if (currentEnrollment) { setEnrollment(currentEnrollment); }
      }
      await fetchComments();
      await fetchReviews();
    } catch (error) { console.error("Failed to fetch skill details:", error); } 
    finally { setLoading(false); }
  }, [id, user, fetchComments, fetchReviews]); // 3. Add all dependencies

  useEffect(() => {
    fetchSkillData();
  }, [fetchSkillData]); // 4. Use fetchSkillData as the dependency

  // --- 2. NEW: Group resources by module ---
  // useMemo will re-run this logic only when skill changes
  const modules = useMemo(() => {
    if (!skill || !skill.resources) return new Map();
    return skill.resources.reduce((acc, resource) => {
      const moduleName = resource.module_title || 'General';
      if (!acc.has(moduleName)) acc.set(moduleName, []);
      acc.get(moduleName).push(resource);
      return acc;
    }, new Map());
  }, [skill]);

  // --- Action Handlers ---
  const handleEnroll = async () => {
      try {
          await apiClient.post(`/api/skills/${id}/enroll/`);
          alert('Successfully enrolled!');
          fetchSkillData();
        } catch (error) {
          console.error("Enrollment failed:", error);
          alert('Enrollment failed. You may already be enrolled.');
        }
  };
  const handleCompleteResource = async (resourceId) => {
      try {
          const response = await apiClient.post(`/api/resources/${resourceId}/complete/`);
          alert(`Resource completed! Your new progress is ${response.data.progress}%. XP: ${response.data.total_xp}`);
          fetchSkillData();
        } catch (error) {
          console.error("Failed to complete resource:", error);
          alert('Failed to mark as complete. Are you enrolled?');
        }
  };

  const handleCommentSubmit = async (e) => {
      e.preventDefault();
      if (!newCommentContent.trim()) return;

      const payload = {
          content: newCommentContent,
          parent: replyingTo ? replyingTo.id : null
      };

      try {
          await apiClient.post(`/api/skills/${id}/comments/`, payload);
          setNewCommentContent('');
          setReplyingTo(null);
          await fetchComments();
      } catch (error) {
          console.error("Failed to post comment:", error);
          alert("Error posting comment. You must be logged in.");
      }
  };

  const handleReviewSubmit = async (e) => {
      e.preventDefault();
      if (rating === 0) {
          alert("Please select a rating.");
          return;
      }
      try {
          await apiClient.post(`/api/skills/${id}/reviews/`, {
              rating: rating,
              comment: reviewComment
          });
          setRating(0);
          setReviewComment('');
          await fetchReviews();
          await fetchSkillData(); 
      } catch (error) {
          console.error("Failed to post review:", error);
          alert("Error posting review. You may have already reviewed this skill.");
      }
  };

  // --- NEW: Handler for forking a skill ---
  const handleFork = async () => {
    try {
        await apiClient.post(`/api/skills/${id}/fork/`);
        alert("Skill forked successfully! You can find it in 'My Skills'.");
        navigate('/my-skills');
    } catch (error) {
        if (error.response && error.response.status === 400) {
            alert("You have already forked this skill.");
        } else {
            console.error("Failed to fork skill:", error);
            alert("Failed to fork skill.");
        }
    }
  };

  if (loading) return <Spinner />;
  if (!skill) return <p>Skill not found.</p>;

  const isEnrolled = !!enrollment;
  const hasAlreadyReviewed = user ? reviews.some(review => review.username === user.name) : false;
  const canReview = enrollment && enrollment.progress === 100 && !hasAlreadyReviewed;

  // NEW: Logic for showing the fork button
  const isCreator = user ? (user.name === skill.created_by_username || user.email === skill.created_by_username) : false;
  const canFork = user && skill.is_public && !isCreator;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-xl">
        {/* Skill Header */}
        <div className="flex justify-between items-start mb-6">
            <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-1">{skill.name}</h1>
                <p className="text-slate-500">By {skill.created_by_username}</p>
            </div>
            <div className="flex space-x-3">
                {canFork && (
                    <button 
                        onClick={handleFork} 
                        className="px-6 py-3 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-600 transition-colors shadow-pixel-button active:shadow-pixel-button-hover active:translate-x-0.5 active:translate-y-0.5"
                    >
                        Fork Skill
                    </button>
                )}
                {user && !isEnrolled && (
                    <button onClick={handleEnroll} className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-pixel-button active:shadow-pixel-button-hover active:translate-x-0.5 active:translate-y-0.5">
                        Enroll in Skill
                    </button>
                )}
            </div>
        </div>
        <p className="text-slate-700 my-6 text-lg">{skill.description}</p>
        
        {isEnrolled && <ProgressBar progress={enrollment.progress} />}

        {/* --- 3. MODIFIED: Resources List --- */}
        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Skill Resources</h2>
        {Array.from(modules.entries()).map(([moduleName, resources]) => (
          <div key={moduleName} className="mb-8">
            <h3 className="text-xl font-bold text-slate-700 mb-4 pb-2 border-b border-slate-200">{moduleName}</h3>
            <div className="space-y-4">
              {resources.map(resource => (
                <div key={resource.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                  <div>
                    <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded-full uppercase">{resource.resource_type}</span>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-lg font-medium text-indigo-600 hover:text-indigo-800 ml-4">
                      {resource.title}
                    </a>
                  </div>
                  {isEnrolled && (
                    <button 
                      onClick={() => handleCompleteResource(resource.id)}
                      className={`px-4 py-2 text-xs font-medium rounded-full bg-indigo-600 text-white hover:bg-indigo-700`}>
                      Mark as Complete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {/* --- End of Modified Section --- */}
        
        {/* Reviews Section */}
        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Reviews</h2>
        {canReview && (
          <form onSubmit={handleReviewSubmit} className="mb-6 p-6 border border-slate-200 rounded-lg bg-white shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-slate-900">Leave a Review</h3>
              <div className="mb-3">
                  <StarRating rating={rating} onRating={setRating} />
              </div>
              <textarea
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-700 text-sm focus:outline-none"
                  rows="3"
                  placeholder="Share your thoughts on this skill..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
              ></textarea>
              <button type="submit" className="mt-3 px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-sm">
                  Submit Review
              </button>
          </form>
        )}
        <div className="space-y-4">
          {reviews.length > 0 ? reviews.map(review => (
             <div key={review.id} className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
               <p className="font-semibold text-slate-900">{review.username} - {'★'.repeat(review.rating)}</p>
               <p className="text-slate-600">{review.comment}</p>
             </div>
          )) : <p className="text-slate-600">No reviews yet. Complete the skill to leave the first review!</p>}
        </div>

        {/* Comments Section */}
        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Comments</h2>
        {user && (
            <form onSubmit={handleCommentSubmit} className="mb-6">
                {replyingTo && (
                    <div className="mb-2 p-2 bg-white rounded-lg flex justify-between items-center border border-slate-200 shadow-sm">
                        <span className="text-sm font-semibold text-slate-700">Replying to @{replyingTo.username}</span>
                        <button 
                            type="button" 
                            onClick={() => setReplyingTo(null)}
                            className="text-xs text-red-500 font-semibold hover:underline">
                            Cancel
                        </button>
                    </div>
                )}
                <textarea
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-700 text-sm focus:outline-none"
                    rows="3"
                    placeholder={replyingTo ? "Write your reply..." : "Add your comment..."}
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                ></textarea>
                <button type="submit" className="mt-3 px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-sm">
                    {replyingTo ? "Post Reply" : "Post Comment"}
                </button>
            </form>
        )}
        <div className="space-y-4">
          {comments.length > 0 ? comments.map(comment => (
             <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  onReplyClick={setReplyingTo}
              />
          )) : <p className="text-slate-600">No comments yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default SkillDetailPage;