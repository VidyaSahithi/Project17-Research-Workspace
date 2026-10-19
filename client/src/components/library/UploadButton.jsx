
import { useRef } from "react";

export default function UploadButton({ onFileSelected, uploading }) {
  const inputRef = useRef(null);

  function handleChange(event) {
    const file = event.target.files?.[0];

    if (file) {
      onFileSelected(file);
    }

    // Allow the same file to be selected again after an error.
    event.target.value = "";
  }

  return (
    <>
      <button
        type="button"
        className="primary-button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? "Uploading..." : "+ Upload Paper"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,application/pdf,text/plain"
        onChange={handleChange}
        hidden
        disabled={uploading}
      />
    </>
  );
}
