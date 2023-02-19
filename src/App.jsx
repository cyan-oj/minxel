import { useState } from 'react';
import ColorSliders from './Workspace/ColorSliders';
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
				<div className="toolbox" id="welcome-settings">
						<ColorSliders oldColor={ backgroundColor } setNewColor={ setBackgroundColor } oldColorText={ "background color" } />
						<label htmlFor="width">width
							<input type="number" value={ width } onChange={ e => setWidth(e.target.value ? Number(e.target.value) : 0 )} />
						</label>
						<label htmlFor="width">height
							<input type="number" value={ height } onChange={ e => setHeight(e.target.value ? Number(e.target.value) : 0 )} />
						</label>
						<button onClick={() => setShowWorkspace( true )}>start drawing!</button>
				</div>
				<div id="startup-message">
					welcome to minxel! to start drawing, choose your starting properties and hit "start"
				</div>
			</div>
		}
		{ showWorkspace &&
			<Workspace  width={ width } height={ height }/>
		}
	</>
	)
}

export default App;