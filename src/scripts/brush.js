// brush creator and driver 
// keep draw function here for now?

// draw function pressure events should only temporarily modify brushes, it should not change the brushes' properties
class Brush {
  constructor(properties) {
    this.size = properties.size;
  }
}

module.exports = Brush;