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

        width: "360px",
        maxWidth: "calc(100vw - 40px)",

        padding: "28px",

        background:
          "linear-gradient(145deg, rgba(12,12,12,0.96), rgba(4,4,4,0.94))",

        border:
          "1px solid rgba(255,255,255,0.16)",

        borderRadius: "2px",

        color: "white",

        backdropFilter: "blur(18px)",

        boxShadow:
          "0 20px 60px rgba(0,0,0,0.45)",

        animation:
          "vehiclePanelEnter 0.35s ease-out",
      }}
    >

      {/* =====================================================
          TOP ACCENT
      ===================================================== */}

      <div
        style={{
          width: "35px",
          height: "2px",
          background: "white",
          marginBottom: "20px",
          opacity: 0.8,
        }}
      />


      {/* =====================================================
          CATEGORY
      ===================================================== */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >

        <p
          style={{
            margin: 0,

            fontSize: "9px",

            letterSpacing: "3px",

            textTransform: "uppercase",

            opacity: 0.45,
          }}
        >
          VEHICLE DETAIL
        </p>

        <span
          style={{
            fontSize: "9px",

            letterSpacing: "2px",

            opacity: 0.35,
          }}
        >
          REVUELTO
        </span>

      </div>


      {/* =====================================================
          TITLE
      ===================================================== */}

      <h2
        style={{
          margin: "0 0 18px",

          fontSize: "30px",

          fontWeight: 500,

          lineHeight: 1.05,

          letterSpacing: "-1px",

          textTransform: "uppercase",
        }}
      >
        {title}
      </h2>


      {/* =====================================================
          DIVIDER
      ===================================================== */}

      <div
        style={{
          width: "100%",

          height: "1px",

          background:
            "rgba(255,255,255,0.1)",

          marginBottom: "18px",
        }}
      />


      {/* =====================================================
          DESCRIPTION
      ===================================================== */}

      <p
        style={{
          margin: 0,

          fontSize: "13px",

          lineHeight: 1.75,

          color: "rgba(255,255,255,0.72)",
        }}
      >
        {description}
      </p>


      {/* =====================================================
          INSPECTION STATUS
      ===================================================== */}

      <div
        style={{
          display: "flex",

          alignItems: "center",

          gap: "8px",

          marginTop: "24px",

          paddingTop: "16px",

          borderTop:
            "1px solid rgba(255,255,255,0.08)",
        }}
      >

        <span
          style={{
            width: "6px",

            height: "6px",

            borderRadius: "50%",

            background: "white",

            boxShadow:
              "0 0 8px rgba(255,255,255,0.8)",
          }}
        />

        <span
          style={{
            fontSize: "9px",

            letterSpacing: "2px",

            opacity: 0.45,
          }}
        >
          COMPONENT INSPECTION
        </span>

      </div>


      {/* =====================================================
          CLOSE BUTTON
      ===================================================== */}

      <button
        onClick={onClose}

        style={{
          marginTop: "22px",

          width: "100%",

          padding: "12px 18px",

          background:
            "rgba(255,255,255,0.04)",

          border:
            "1px solid rgba(255,255,255,0.2)",

          color: "white",

          cursor: "pointer",

          fontSize: "9px",

          letterSpacing: "3px",

          transition:
            "background 0.2s ease, border-color 0.2s ease",
        }}

        onMouseEnter={(event) => {
          event.currentTarget.style.background =
            "rgba(255,255,255,0.1)";

          event.currentTarget.style.borderColor =
            "rgba(255,255,255,0.4)";
        }}

        onMouseLeave={(event) => {
          event.currentTarget.style.background =
            "rgba(255,255,255,0.04)";

          event.currentTarget.style.borderColor =
            "rgba(255,255,255,0.2)";
        }}
      >
        CLOSE INSPECTION
      </button>


      {/* =====================================================
          PANEL ANIMATION
      ===================================================== */}

      <style>
        {`
          @keyframes vehiclePanelEnter {
            from {
              opacity: 0;
              transform: translateY(18px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

    </div>
  );
}

export default VehicleInfoPanel;