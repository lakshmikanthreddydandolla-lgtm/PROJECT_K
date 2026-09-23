import { useState } from "react";
import "./App.css";

import Intro from "./components/Intro";
import VehicleSelector from "./components/VehicleSelector";
import RevueltoShowroom from "./components/RevueltoShowroom";

function App() {
  const [showroomStarted, setShowroomStarted] =
    useState(false);

  const [selectedVehicle, setSelectedVehicle] =
    useState<"revuelto" | "h2r" | null>(null);

  return (
    <>
      {!showroomStarted ? (
        <Intro
          onEnter={() =>
            setShowroomStarted(true)
          }
        />
      ) : !selectedVehicle ? (
        <VehicleSelector
          onBack={() =>
            setShowroomStarted(false)
          }
          onSelectVehicle={(vehicle) =>
            setSelectedVehicle(vehicle)
          }
        />
      ) : selectedVehicle === "revuelto" ? (
        <RevueltoShowroom
          onBack={() =>
            setSelectedVehicle(null)
          }
        />
      ) : (
        <div className="selected-vehicle">
          <h1>KAWASAKI NINJA H2R</h1>

          <button
            className="back-button"
            onClick={() =>
              setSelectedVehicle(null)
            }
          >
            ← BACK TO VEHICLES
          </button>
        </div>
      )}
    </>
  );
}

export default App;