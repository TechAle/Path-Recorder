import OBR from "@owlbear-rodeo/sdk";
import { ID } from "./globalVariables";

export async function animation(itemId, pathName) {
  const globalItems = await OBR.scene.items.getItems([itemId]);
  let item = globalItems[0];
  let interaction = await OBR.interaction.startItemInteraction(item)
  let [update, stop] = interaction

  let pathLength;
  let currentIndex = 0;
  let isRunning = false;
  let path = [];

  while (!isRunning) {
    await OBR.scene.items.getItems([itemId]).then(async (items) => {
      let item = items[0];
      item.metadata[`${ID}/moving`] = {moving: true};
      await OBR.scene.items.updateItems([itemId], (items) => {
        let item = items[0];
        item.position = { x: item.metadata[`${ID}/path`][pathName][0].x, y: item.metadata[`${ID}/path`][pathName][0].y };
        item.rotation = item.metadata[`${ID}/path`][pathName][0].rotation;
      });
      await update((itemNow) => {
        itemNow.position.x = itemNow.metadata[`${ID}/path`][pathName][0].x;
        itemNow.position.y = itemNow.metadata[`${ID}/path`][pathName][0].y;
      });
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
        setTimeout(() => {
        }, 100);
      }
    });
  }

  const animationInterval = 500;

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


    let newX, newY, newRotation;

    for (let j = 0; j < steps; j++) {
      newX = currentX + stepX * (j + 1);
      newY = currentY + stepY * (j + 1);
      newRotation = currentRotation + stepRotation * (j + 1);

      let stepStartTime = new Date().getTime();

      update((item) => {
        item.position = { x: newX, y: newY };
        item.rotation = newRotation;
        console.log(item.position, item.rotation)
      });

      await OBR.scene.items.getItems([itemId]).then((items) => {
        let item = items[0];
        isRunning = item.metadata[`${ID}/moving`] !== undefined;
      });

      if (!isRunning) break;

      let stepEndTime = new Date().getTime();
      await new Promise((resolve) => setTimeout(resolve, animationInterval - (stepEndTime - stepStartTime)));
    }



    if (!isRunning) {
      await OBR.scene.items.updateItems([itemId], (items) => {
        let item = items[0];
        item.position = { x: newX, y: newY};
        item.rotation = newRotation;
      }).then(() => {
        stop()
      });
      break;
    }

    await OBR.scene.items.getItems([itemId]).then((items) => {
      let item = items[0];
      isRunning = item.metadata[`${ID}/moving`] !== undefined;
    });

    currentIndex = (currentIndex + 1) % pathLength;
    await OBR.scene.items.updateItems([itemId], (items) => {
        let item = items[0];
        item.position = { x: newX, y: newY};
        item.rotation = newRotation;
        console.log(newX, newY);
    });
    stop();
    interaction = await OBR.interaction.startItemInteraction(item);
    [update, stop] = interaction;
  }
}