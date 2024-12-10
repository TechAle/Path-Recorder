import OBR, {buildImage} from "@owlbear-rodeo/sdk";
import {ID, signals, memoryMoving} from "./globalVariables";


async function createLocalImageCopy(item) {
  const newItem = buildImage(
      {
        height: item.image.height,
        width: item.image.width,
        url: item.image.url,
        mime: item.image.mime,
      },
      { dpi: item.grid.dpi, offset: item.grid.offset }
  ).position(
        item.position
    ).rotation(
        item.rotation
    ).scale(
        item.scale
  )
      .build();

  await OBR.scene.local.addItems([newItem])
  memoryMoving[item.id] = newItem.id
  console.log(memoryMoving)
  return newItem.id
}


OBR.onReady( () => {
    OBR.broadcast.onMessage(signals.startAnimating, async (message) => {
        console.log(message.data);
        startAnimation(message.data.globalItems, message.data.pathName);
    });

    OBR.broadcast.onMessage(signals.stopAnimating, async (message) => {
      delete memoryMoving[message.data.itemId]
      console.log(memoryMoving)
    });
});

export async function startAnimation(itemObject, pathName) {
  let itemId = await createLocalImageCopy(itemObject);

  let pathLength;
  let currentIndex = 0;
  let path = [];


  await OBR.scene.local.updateItems([itemId], (items) => {
    let item = items[0];
    console.log(item)
    item.position.x = itemObject.metadata[`${ID}/path`][pathName][0].x;
    item.position.y = itemObject.metadata[`${ID}/path`][pathName][0].y;
    pathLength = itemObject.metadata[`${ID}/path`][pathName].length;
    for (let i = 0; i < pathLength; i++) {
      path.push({
        x: itemObject.metadata[`${ID}/path`][pathName][i].x,
        y: itemObject.metadata[`${ID}/path`][pathName][i].y,
        rotation: itemObject.metadata[`${ID}/path`][pathName][i].rotation,
        time: itemObject.metadata[`${ID}/path`][pathName][i].time,
      });
    }
  });

  const animationInterval = 50;
  let first = true;

  while (memoryMoving[itemObject.id]) {
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
      if (!memoryMoving[itemObject.id]) {
        break
      }
      let newX = currentX + stepX * (j + 1);
      let newY = currentY + stepY * (j + 1);
      let newRotation = currentRotation + stepRotation * (j + 1);

      let stepStartTime = new Date().getTime();

      await OBR.scene.local.updateItems([itemId], (items) => {
        let item = items[0];
        item.position = {x: newX, y: newY};
        item.rotation = newRotation;
      });

      let stepEndTime = new Date().getTime();
      let waitTime = animationInterval - (stepEndTime - stepStartTime);
      let startTime = new Date().getTime();
      let endTime = new Date().getTime() + waitTime;
      // I know this is the worst way to do this, but timeout has problems
      // When the tab is not active
      while (startTime <= endTime) {
        startTime = new Date().getTime();
      }
      if (!memoryMoving[itemObject.id]) {
        break
      }
    }

    if (!memoryMoving[itemObject.id]) {
      break
    }

    await OBR.scene.local.updateItems([itemId], (items) => {
      let item = items[0];
      item.position = {x: nextX, y: nextY};
      item.rotation = nextRotation;
    });

    currentIndex = (currentIndex + 1) % pathLength;
  }

  await OBR.scene.local.deleteItems([itemId]);
}

/*
  This whole system will work with the use of local items.
  So, when an animation starts the owner send to everyone "startAnimation" with then as a params "itemId" and "pathName"
  Then the clients are gonna create their local copy of the item and start the animation
  Said this, when someone log in they will ask "is there anything i need to animate?"
  And the owner will answer saying if there is or not
 */
export async function callAnimation(itemId, pathName) {
  let globalItems = await OBR.scene.items.getItems([itemId]);
  await OBR.scene.items.updateItems([itemId], (items) => {
    let item = items[0];
    item.visible = false;
  });
  globalItems = globalItems[0];
  await OBR.broadcast.sendMessage(signals.startAnimating, { globalItems, pathName }, {destination: "ALL"});
}

export async function stopAnimation(itemId) {
  let coords = {x: 0, y:0}
  await OBR.scene.local.updateItems([memoryMoving[itemId]], (items) => {
    let item = items[0];
    // Stupid proxies
    coords = {
        x: item.position.x,
        y: item.position.y
    }
  });
  await OBR.scene.items.updateItems([itemId],  (items) => {
    let item = items[0];
    item.visible = true;
    item.position = coords
  });
  await OBR.broadcast.sendMessage(signals.stopAnimating, {itemId}, {destination: "ALL"});
}