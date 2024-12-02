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
    let currentX = path[currentIndex].x;
    let currentY = path[currentIndex].y;
    let currentRotation = path[currentIndex].rotation;
    let nextX = path[(currentIndex + 1) % pathLength].x;
    let nextY = path[(currentIndex + 1) % pathLength].y;
    let nextRotation = path[(currentIndex + 1) % pathLength].rotation;
    let time = path[currentIndex].time;

    let steps = time / animationInterval;
    let stepX = (nextX - currentX) / steps;
    let stepY = (nextY - currentY) / steps;
    let stepRotation = Math.abs(nextRotation - currentRotation) > Math.abs(currentRotation - nextRotation)
        ? (currentRotation - nextRotation) / steps
        : (nextRotation - currentRotation) / steps;

    let startTime = new Date().getTime();

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

    let endTime = new Date().getTime();
    console.log(endTime - startTime + " " + time);

    if (!isRunning) break;

    await OBR.scene.local.updateItems([itemId], (items) => {
      let item = items[0];
      item.position = { x: nextX, y: nextY };
      isRunning = item.metadata[`${ID}/moving`] !== undefined;
    });

    currentIndex = (currentIndex + 1) % pathLength;
  }
}