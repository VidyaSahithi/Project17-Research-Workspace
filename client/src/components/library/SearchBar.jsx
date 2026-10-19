
export default function SearchBar({ value, onChange }) {
  return (
    <div className="document-search">
      <span aria-hidden="true">⌕</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search research papers..."
        aria-label="Search research papers"
      />
    </div>
  );
}
