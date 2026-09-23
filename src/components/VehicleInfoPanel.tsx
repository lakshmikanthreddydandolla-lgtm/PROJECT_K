interface VehicleInfoPanelProps {
  title: string;
  description: string;
  onClose: () => void;
}

function VehicleInfoPanel({
  title,
  description,
  onClose,
}: VehicleInfoPanelProps) {
  return (
    <div
      style={{
        position: "absolute",
        zIndex: 20,
        right: "40px",
        bottom: "80px",
        width: "320px",
        padding: "25px",
        background: "rgba(5, 5, 5, 0.92)",
        border: "1px solid rgba(255,255,255,0.2)",
        color: "white",
        backdropFilter: "blur(10px)",
      }}
    >
      <p
        style={{
          margin: "0 0 12px",
          fontSize: "10px",
          letterSpacing: "4px",
          opacity: 0.5,
        }}
      >
        VEHICLE DETAIL
      </p>

      <h2
        style={{
          margin: "0 0 15px",
          fontSize: "28px",
          letterSpacing: "-1px",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          margin: 0,
          fontSize: "13px",
          lineHeight: 1.7,
          opacity: 0.7,
        }}
      >
        {description}
      </p>

      <button
        onClick={onClose}
        style={{
          marginTop: "22px",
          padding: "10px 18px",
          background: "transparent",
          border: "1px solid #555",
          color: "white",
          cursor: "pointer",
          fontSize: "10px",
          letterSpacing: "2px",
        }}
      >
        CLOSE
      </button>
    </div>
  );
}

export default VehicleInfoPanel;