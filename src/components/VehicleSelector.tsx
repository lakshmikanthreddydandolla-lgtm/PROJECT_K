interface VehicleSelectorProps {
  onBack: () => void;
  onSelectVehicle: (vehicle: "revuelto" | "h2r") => void;
}

function VehicleSelector({
  onBack,
  onSelectVehicle,
}: VehicleSelectorProps) {
  return (
    <main className="vehicle-selector">
      <div className="selector-header">
        <p className="selector-label">PROJECT_K</p>

        <h1>CHOOSE YOUR VEHICLE</h1>

        <p className="selector-description">
          Select a machine to enter its interactive showroom.
        </p>
      </div>

      <div className="vehicle-cards">

        <button
          className="vehicle-card"
          onClick={() => onSelectVehicle("revuelto")}
        >
          <div className="vehicle-card-content">
            <p className="vehicle-brand">LAMBORGHINI</p>

            <h2>REVUELTO</h2>

            <p className="vehicle-type">
              V12 HYBRID SUPER SPORTS CAR
            </p>

            <div className="vehicle-specs">
              <span>1015 CV</span>
              <span>V12</span>
              <span>&gt;350 KM/H</span>
            </div>

            <span className="vehicle-arrow">→</span>
          </div>
        </button>

        <button
          className="vehicle-card"
          onClick={() => onSelectVehicle("h2r")}
        >
          <div className="vehicle-card-content">
            <p className="vehicle-brand">KAWASAKI</p>

            <h2>NINJA H2R</h2>

            <p className="vehicle-type">
              SUPERCHARGED HYPERBIKE
            </p>

            <div className="vehicle-specs">
              <span>998 CC</span>
              <span>INLINE-4</span>
              <span>SUPERCHARGED</span>
            </div>

            <span className="vehicle-arrow">→</span>
          </div>
        </button>

      </div>

      <button
        className="back-button"
        onClick={onBack}
      >
        ← BACK TO HOME
      </button>
    </main>
  );
}

export default VehicleSelector;