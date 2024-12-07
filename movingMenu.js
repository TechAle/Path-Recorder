import OBR from "@owlbear-rodeo/sdk";
import { ID } from "./globalVariables";

export async function animation(itemId, pathName) {
  const globalItems = await OBR.scene.items.getItems([itemId]);
  await OBR.scene.local.addItems(globalItems);

  let pathLength;
  let currentIndex = 0;
  let isRunning = false;
  let path = [];

  while (!isRunning) {
    await OBR.scene.local.updateItems([itemId], (items) => {
      let item = items[0];
      item.metadata[`${ID}/moving`] = { moving: true };
      item.position.x = item.metadata[`${ID}/path`][pathName][0].x;
      item.position.y = item.metadata[`${ID}/path`][pathName][0].y;
      pathLength = item.metadata[`${ID}/path`][pathName].length;
      isRunning = item.metadata[`${ID}/moving`] !== undefined;

      if (isRunning) {
        for (let i = 0; i < pathLength; i++) {
          path.push({
            x: item.metadata[`${ID}/path`][pathName][i].x,
            y: item.metadata[`${ID}/path`][pathName][i].y,
            rotation: item.metadata[`${ID}/path`][pathName][i].rotation,
            time: item.metadata[`${ID}/path`][pathName][i].time,
          });
        }
      } else {
        setTimeout(() => {}, 100);
      }
    });
  }

  const animationInterval = 50;

  while (isRunning) {
    let currentX = parseFloat(path[currentIndex].x);
    let currentY = parseFloat(path[currentIndex].y);
    let currentRotation = parseInt(path[currentIndex].rotation);
    let nextX = parseFloat(path[(currentIndex + 1) % pathLength].x);
    let nextY = parseFloat(path[(currentIndex + 1) % pathLength].y);
    let nextRotation = parseInt(path[(currentIndex + 1) % pathLength].rotation);
    let time = parseInt(path[currentIndex].time);

    let steps = time / animationInterval;
    let stepX = (nextX - currentX) / steps;
    let stepY = (nextY - currentY) / steps;
    // Calculate stepRotations
    // Calculate stepRotation
    let rotationDifference = nextRotation - currentRotation;
    if (rotationDifference > 180) {
      rotationDifference -= 360;
    } else if (rotationDifference < -180) {
      rotationDifference += 360;
    }
    let stepRotation = rotationDifference / steps;




    for (let j = 0; j < steps; j++) {
      let newX = currentX + stepX * (j + 1);
      let newY = currentY + stepY * (j + 1);
      let newRotation = currentRotation + stepRotation * (j + 1);

      let stepStartTime = new Date().getTime();

      await OBR.scene.local.updateItems([itemId], (items) => {
        let item = items[0];
        item.position = { x: newX, y: newY };
        item.rotation = newRotation;
        isRunning = item.metadata[`${ID}/moving`] !== undefined;
      });

      if (!isRunning) break;

      let stepEndTime = new Date().getTime();
      await new Promise((resolve) => setTimeout(resolve, animationInterval - (stepEndTime - stepStartTime)));
    }



    if (!isRunning) break;

    await OBR.scene.local.updateItems([itemId], (items) => {
      let item = items[0];
      item.position = { x: nextX, y: nextY };
      item.rotation = nextRotation;
      isRunning = item.metadata[`${ID}/moving`] !== undefined;
    });

    currentIndex = (currentIndex + 1) % pathLength;
  }
}