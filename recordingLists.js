import OBR from "@owlbear-rodeo/sdk";
import {ID} from "./globalVariables";
import {animation} from "./movingMenu.js"

export const renderList = async (items) => {
  if (!items) {
    try {
      let prova = await OBR.scene.items.getItems();
      renderList(prova)
    }catch (e) {
      OBR.scene.onReadyChange(() => {
        OBR.scene.items.getItems().then((items) => {
          renderList(items)
        });
      });
    }
    return;
  }
  // Get the name and initiative of any item with
  // our initiative metadata
  const element = document.querySelector("#initiative-list");
  const movingNpcs = {};
  for (const item of items) {
    const paths = item.metadata[`${ID}/path`];
    const moving = item.metadata[`${ID}/moving`];
    if (paths) {
      movingNpcs[item.id] = {
        image: item.image.url,
        name: item.name,
        paths: paths,
        moving: moving !== undefined
      }
    }
  }

  element.innerHTML = '';
  // Iterate through the data object
  for (const id in movingNpcs) {
    const item = movingNpcs[id];
    // Create the elements for each item
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('item');

    // Display the image and name
    const imageElement = document.createElement('img');
    imageElement.src = item.image;
    imageElement.alt = item.name;
    itemDiv.appendChild(imageElement);

    const nameElement = document.createElement('h3');
    nameElement.textContent = item.name;
    itemDiv.appendChild(nameElement);
    const buttonToggle = document.createElement('span');
    buttonToggle.classList.add("buttonToggle")
    buttonToggle.innerHTML = '&#x2193';
    buttonToggle.addEventListener('click', () => {
      const coordsDiv = document.querySelector(`#coords-${id}`);
      if (coordsDiv.style.display === 'none') {
        coordsDiv.style.display = 'block';
        buttonToggle.innerHTML = '&#x2193';
      } else {
        coordsDiv.style.display = 'none';
        buttonToggle.innerHTML = '&#x2191';
      }
    });
    itemDiv.appendChild(buttonToggle);


    // Append the item to the container
    element.appendChild(itemDiv);

    for(const pathName in item.paths) {

      const nameDiv = document.createElement('div');
        nameDiv.textContent = pathName;
      nameDiv.classList.add('name');
      element.appendChild(nameDiv);

      const coordsDiv = document.createElement('div');
      coordsDiv.classList.add('coordinates');
      coordsDiv.id = `coords-${id}`;

      item.paths[pathName].forEach((coord, index) => {
        const coordDiv = document.createElement('div');
        coordDiv.classList.add('coordinate');

        // Index
        const indexDiv = document.createElement('div');
        indexDiv.textContent = index + 1;
        indexDiv.classList.add('index');

        // X and Y
        const xSpan = document.createElement('span');
        xSpan.textContent = 'X';
        const xInput = createInput('x', coord.x, id, index);
        const ySpan = document.createElement('span');
        ySpan.textContent = 'Y';
        const yInput = createInput('y', coord.y, id, index);

        // Rotation and Time
        const rotationSpan = document.createElement('span');
        rotationSpan.textContent = 'Rot.';
        const rotationInput = createInput('rotation', coord.rotation, id, index);
        const timeSpan = document.createElement('span');
        timeSpan.textContent = 'Time';
        const timeInput = createInput('time', coord.time, id, index);

        // Append elements to the container
        coordDiv.appendChild(indexDiv); // Index
        const divX = document.createElement('div');
        divX.appendChild(xSpan); // X label
        divX.appendChild(xInput); // X input
        divX.classList.add("cell");
        coordDiv.appendChild(divX);
        const divY = document.createElement('div');
        divY.appendChild(ySpan); // Y label
        divY.appendChild(yInput); // Y input
        divY.classList.add("cell");
        coordDiv.appendChild(divY);
        const space = document.createElement('div');
        coordDiv.appendChild(space);
        const divRotation = document.createElement('div');
        divRotation.appendChild(rotationSpan); // Rotation label
        divRotation.appendChild(rotationInput); // Rotation input
        divRotation.classList.add("cell");
        coordDiv.appendChild(divRotation);
        const divTime = document.createElement('div');
        divTime.appendChild(timeSpan); // Time label
        divTime.appendChild(timeInput); // Time input
        divTime.classList.add("cell");
        coordDiv.appendChild(divTime);


        coordsDiv.appendChild(coordDiv);
      });


      const divButton = document.createElement('div');
      const buttonMove = document.createElement('button');
      buttonMove.classList.add(`${id}button`)
      if (item.moving) {
        buttonMove.textContent = 'Stop moving';
        buttonMove.moving = true;
      } else {
        buttonMove.textContent = 'Start moving';
        buttonMove.moving = false;
      }
      buttonMove.addEventListener('click', (event) => {
        if(event.target.moving) {
          OBR.scene.items.updateItems([id], (items) => {
            const item = items[0];
            delete item.metadata[`${ID}/moving`];
          });
        } else
          OBR.scene.items.updateItems([id], (items) => {
            const item = items[0];
            item.metadata[`${ID}/moving`] = {
              moving: true
            };
            let id = item.id;

            animation(id, pathName)
          });
        event.target.moving = !event.target.moving;
        let t = document.getElementsByClassName(`${id}button`)
        for (let i = 0; i < t.length; i++) {
          t[i].textContent = event.target.moving ? 'Stop moving' : 'Start moving';
          t[i].moving = event.target.moving;
        }
      });
      divButton.appendChild(buttonMove);
      divButton.classList.add('buttonMove');
      const buttonDelete = document.createElement('button');
      buttonDelete.idClass = id
      divButton.classList.add('buttonMove');
      buttonDelete.textContent = 'Delete';
      buttonDelete.addEventListener('click', async (event) => {
        // Check if it's moving with the api
        let items = await OBR.scene.items.getItems([event.target.idClass])
        let item = items[0];
        let moving = item.metadata[`${ID}/moving`];
        if (moving) {
          alert("First stop moving")
        } else {
          OBR.scene.items.updateItems([id], (items) => {
            const item = items[0];
            delete item.metadata[`${ID}/path`][pathName];
            if (Object.keys(item.metadata[`${ID}/path`]).length === 0) {
              delete item.metadata[`${ID}/path`];
            }
          }).then(() => {
            renderList();
          });
        }
      });
      divButton.appendChild(buttonDelete);
      coordsDiv.appendChild(divButton);
      element.appendChild(coordsDiv);
    }


  }


};


// Function to create input elements for x, y, and time
function createInput(type, value, id, index) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = value;
  input.dataset.id = id; // Store the id for reference
  input.dataset.index = index; // Store the index for reference
  input.dataset.type = type; // Store the type (x, y, time)

  // Add event listener to track when the input changes
  input.addEventListener('input', handleInputChange);

  return input;
}

// Function to handle input changes
function handleInputChange(event) {
  const input = event.target;
  const id = input.dataset.id;
  const index = input.dataset.index;
  const type = input.dataset.type;
  const newValue = input.value;

  // Update the corresponding data in the dictionary
  // Update items metadata with owlbear
    OBR.scene.items.updateItems([id], (items) => {
        const item = items[0];
        const path = item.metadata[`${ID}/path`];
        path[index][type] = newValue;
    });
}
