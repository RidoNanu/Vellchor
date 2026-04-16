import { formatDate } from '../../utils/text'

function CommentList({ comments }) {
  return (
    <section className="comments">
      <h3>Comments</h3>
      {!comments.length ? (
        <p className="status-text">No comments yet.</p>
      ) : (
        <ul>
          {comments.map((comment) => (
            <li key={comment.id}>
              <p className="comment-meta">
                {comment.name || 'Anonymous'} · {formatDate(comment.created_at)}
              </p>
              <p>{comment.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default CommentList
