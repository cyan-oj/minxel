import { useState } from "react";
import Workspace from "./Workspace/Workspace/Workspace";

function App() {
  const [showWorkspace, setShowWorkspace] = useState(true); // set false in prod
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [backgroundColor, setBackgroundColor] = useState([100, 100, 100]);

  return (
    <>
      {!showWorkspace && (
        <div id="welcome">
          <div>welcome to minxel.</div>
          <div id="startup">
            <div id="startup-message">
              minxel is a minimalist WebGL-based painting app designed for rapid
              color experimentation.
              <br />
              <br />
              choose your canvas size and give it a try!
            </div>
            <div id="startup-settings">
              <div className="ratio">
                {width > height ? (
                  <div
                    className="ratio-preview"
                    style={{
                      width: 300,
                      height: (300 * height) / width,
                      backgroundColor: "white",
                    }}
                  />
                ) : (
                  <div
                    className="ratio-preview"
                    style={{
                      width: (300 * width) / height,
                      height: 300,
                      backgroundColor: "white",
                    }}
                  />
                )}
              </div>
              <div id="welcome-settings">
                <div className="welcome-slider">
                  <label className="welcome-label" htmlFor="height">
                    height
                    <input
                      type="number"
                      value={height}
                      onChange={(e) =>
                        setHeight(e.target.value ? Number(e.target.value) : 0)
                      }
                    />
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="1024"
                    value={height}
                    onChange={(e) =>
                      setHeight(e.target.value ? Number(e.target.value) : 0)
                    }
                  />
                </div>
                <div className="welcome-slider">
                  <label className="welcome-label" htmlFor="width">
                    width
                    <input
                      type="number"
                      value={width}
                      onChange={(e) =>
                        setWidth(e.target.value ? Number(e.target.value) : 0)
                      }
                    />
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="1024"
                    value={width}
                    onChange={(e) =>
                      setWidth(e.target.value ? Number(e.target.value) : 0)
                    }
                  />
                </div>
                <button onClick={() => setShowWorkspace(true)}>
                  start drawing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showWorkspace && (
        <Workspace
          width={width}
          height={height}
          backgroundColor={backgroundColor}
        />
      )}
    </>
  );
}

export default App;
