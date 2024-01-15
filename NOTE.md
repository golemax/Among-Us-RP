# Collisions
## Collision detections
> Collisions are calculate only when a part is in movement. 

### Pre-detection
For collisions, every individual object contain hitBox (and multiple hitbox for big object like walls, So they can be divided by rooms)
For detect potential collisions, we use Box/Box collisions (inspired by [Rectangle/Rectangle](http://www.jeffreythompson.org/collision-detection/rect-rect.php))

### Final collisions detections
When Two hitbox are collided, we calculate true collisions with Model/Model collisions (inspired by [Polygone/Polygone](http://www.jeffreythompson.org/collision-detection/poly-poly.php))

## Bounce
If a collision was detected, move is canceled and new position target are calculated from the movement of two model.

### Vertex direction calculate
We calculate the angle and the force of collision with the move vector of the vertex and calcul the angle with le différence beetween the face collided's normal and vertex vector <br>
Bounce of surface can be calculate from angle and surface material's bounce value.<br>
[calcul of force write here later]