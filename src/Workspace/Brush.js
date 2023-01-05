class Brush {
  constructor({ size = 1, pressure = false }) {
    this.size = size;
    this.pressure = pressure;
  }

  get size() {
    return this._size
  }

  set size(newSize) {
    this._size = newSize;
  }
}

const brushProps = {
  size: 2, 
  pressure: false
};

export default Brush;