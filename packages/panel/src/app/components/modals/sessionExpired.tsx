/**
 * Alert
 */
export default function() {
  return (
    <div
      className="alert"
      onClick={(e) => {
        e.stopPropagation()
      }}>
      <h3>Want to stay logged in?</h3>
      <p>Your session has been expired due to inactivity and you're about to be logged out.</p>
      <button
        className={'button-3'}
        style={{
          marginRight: 20
        }}
        onClick={() => {
          
        }}>
        Keep me logged in
      </button>
      <button
        className={'button-1'}
        onClick={() => {
        }}>
        Logout
      </button>
    </div>
  )
}