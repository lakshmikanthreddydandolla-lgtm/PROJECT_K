interface IntroProps {
  onEnter: () => void;
}

function Intro({ onEnter }: IntroProps) {
  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050505",
        color: "white",
        textAlign: "center",
      }}
    >
      <div>
        <p
          style={{
            fontSize: "14px",
            letterSpacing: "6px",
            marginBottom: "30px",
            opacity: 0.6,
          }}
        >
          PROJECT_K
        </p>

        <h1
          style={{
            fontSize: "clamp(50px, 9vw, 120px)",
            lineHeight: "0.9",
            letterSpacing: "-4px",
            margin: 0,
          }}
        >
          ENTER THE
          <br />
          SHOWROOM
        </h1>

        <p
          style={{
            marginTop: "30px",
            fontSize: "16px",
            opacity: 0.6,
          }}
        >
          An interactive 3D vehicle experience.
        </p>

        <button
          onClick={onEnter}
          style={{
            marginTop: "35px",
            padding: "15px 30px",
            border: "1px solid white",
            background: "transparent",
            color: "white",
            cursor: "pointer",
            letterSpacing: "2px",
          }}
        >
          ENTER SHOWROOM
        </button>
      </div>
    </main>
  );
}

export default Intro;