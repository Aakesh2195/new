function Topbar({ title, children }) {
  return (
    <header className="page-header">
      <div><h1>{title}</h1></div>
      {children}
    </header>
  );
}
export default Topbar;
