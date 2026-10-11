function Input({ label, className = "", ...props }) {
  return (
    <label>
      {label}
      <input className={`input ${className}`.trim()} {...props} />
    </label>
  );
}
export default Input;
