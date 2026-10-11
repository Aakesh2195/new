function Card({ children, className = "" }) {
  return <div className={`state-card ${className}`.trim()}>{children}</div>;
}
export default Card;
