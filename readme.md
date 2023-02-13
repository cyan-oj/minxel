# minxel.
#### a minimalist painting app

## [Preview a live version here!](https://cyan-oj.github.io/minxel/)

Minxel is a WebGL-based painting app for quick color experimentation. It's designed around the idea of using very limited palettes, and being able to quickly lay down a composition and tweak colors afterward.

All brushstrokes are stored in history, which allows for quick undo/redo, and the colors, stored by reference to the palette, can be quickly updated on the canvas.

Quick overview of using WebGL to draw lines with pressure sensitivity, with some extra comments: 


```javascript
// src/utils/glHelpers
export const getStroke = ( point1, point2 ) => { 
    const distance = Math.sqrt( Math.pow( point2.x - point1.x, 2 ) + Math.pow( point2.y - point1.y, 2 ))
    const angle = Math.atan2( point2.x - point1.x, point2.y - point1.y )
    const deltaP = point2.pressure - point1.pressure
  return [ distance, angle, deltaP ]
}
```

an event listener on the drawing canvas is triggered when a mouse or pointer moves on the canvas

```javascript
// src/Workspace.jsx

  // event: the React syntheticEvent picked up by the listener, gl: the WebGL 
  // rendering context of the active layer
  const draw = ( event, gl ) => { 
    // grabs pointer position but otherwise exits early if the mouse is not clicked 
    // or tablet pen is not touching the surface
    if ( event.buttons !== 1 ) { 
      setPosition( event )
      return
    }
  
    // ...

    // we want two points, the position detected by the event listener and the previous position
    const lastPoint = JSON.parse(JSON.stringify( position ))
    const currentPoint = setPosition( event )
    // send both points to a helper function that will tell us the difference 
    // between both points, in distance, direction, and pen pressure
    const [ dist, angle, deltaP ] = getStroke( lastPoint, currentPoint )

    //..
    
    // The event listener doesn't fire often enough to make a smooth stroke, but
    // we can use the difference between the two event points to fill in the gap
    // the smaller the increment for i, the more additonal points, the smoother the line.
    // when further brush customization is added, this can be made user-configurable
    for ( let i = 0; i < dist; i += 0.001 ) { 
      const x = lastPoint.x + Math.sin( angle ) * i
      const y = lastPoint.y + Math.cos( angle ) * i
      const pressure = lastPoint.pressure + deltaP / (dist / i)
      const point = {
        position: [ x, y ],
        size: brushes[activeBrush].size * pressure
      }
      // send the point information and the rendering context to a helper function
      // that will use WebGL's tools to actually render each point on canvas
      drawPoint( gl, point.position, point.size, drawColor, glAttributes )
      // add the point to an array that will eventually be saved in stroke history
      stroke.points.push( point )
    }
  }
```