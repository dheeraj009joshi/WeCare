const Button = ({ children, className, onClick }) => (
  <button className={className + " px-4 py-2 rounded"} onClick={onClick}>
    {children}
  </button>
);
export default Button;
