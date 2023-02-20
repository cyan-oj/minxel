import { useState } from 'react';
import Workspace from './Workspace/Workspace'

function App() {	
	const [showWorkspace, setShowWorkspace] = useState( false )
	const [ width, setWidth ] = useState( 512 )
	const [ height, setHeight ] = useState( 512 )
	const [ backgroundColor, setBackgroundColor ] = useState([ 100, 100, 100 ])

	return (
	<>
		{ !showWorkspace &&
			<div id="welcome">
				<div id="startup-message">
					<div>
						welcome to minxel.
					</div>
					<div className="ratio">
						{ width > height 
							? <div className="ratio-preview" style={{ width: 300, height: 300 * height/width, backgroundColor: "white"}}></div>
							: <div className="ratio-preview" style={{ width: 300 * width/height , height: 300, backgroundColor: "white"}}></div>
						}
					</div>
				</div>
				<div id="welcome-settings">
						<label htmlFor="width">height
							<input type="number" value={ height } onChange={ e => setHeight(e.target.value ? Number(e.target.value) : 0 )} />
						</label>
						<label htmlFor="width">width
							<input type="number" value={ width } onChange={ e => setWidth(e.target.value ? Number(e.target.value) : 0 )} />
						</label>
						<button onClick={() => setShowWorkspace( true )}>start drawing!</button>
				</div>
			</div>
		}
		{ showWorkspace &&
			<Workspace  width={ width } height={ height } backgroundColor={ backgroundColor }/>
		}
	</>
	)
}

export default App;