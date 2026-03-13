type PopupMessageProps = {
  notify: string,
  status: number,
}

/**
 * Get status from code
 * @param code Status code
 */
function getStatus(code: number) {
  if(code.toString().match(/^2/g)) {
    return 'success'
  }
  return 'error'
}

/**
 * Popup message either success or error
 */
export default function PopupMessage({status, notify}: PopupMessageProps) {
  if(notify) {
    return <div className={`popup ${getStatus(status)}`}>{notify}</div>
  }
  return null
}