export const getStroke = (point1, point2) => { 
  const distance = Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  const angle = Math.atan2( point2.x - point1.x, point2.y - point1.y );
  return [distance, angle]
}