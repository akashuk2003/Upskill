import React from 'react';

const CommentItem = ({ comment, onReplyClick }) => {
  return (
      <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
              <p className="font-semibold">{comment.username}</p>
              <button 
                  onClick={() => onReplyClick(comment)}
                  className="text-xs text-blue-600 font-semibold hover:underline">
                  Reply
              </button>
          </div>
          <p className="text-gray-700">{comment.content}</p>

          {/* The Recursive Part: Render Replies */}
          {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 pl-6 border-l-2 border-gray-200 space-y-4">
                  {comment.replies.map(reply => (
                      <CommentItem 
                          key={reply.id} 
                          comment={reply} 
                          onReplyClick={onReplyClick} 
                      />
                  ))}
              </div>
          )}
      </div>
  );
};

export default CommentItem;