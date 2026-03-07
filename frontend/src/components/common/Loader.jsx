export default function Loader({ text = "Loading..." }) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.05)",
      }}
    >
      <strong>{text}</strong>
    </div>
  );
}
