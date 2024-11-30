import OBR from "@owlbear-rodeo/sdk";
import {ID} from "./globalVariables";
import {animation} from "./movingMenu.js"

let tryingDelete = false

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
      console.log(paths)
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
    buttonToggle.addEventListener('click', (event) => {
      const elems = document.getElementsByClassName(`wrapper-${id}`)
      for (let i = 0; i < elems.length; i++) {
          if (event.target.innerHTML === '↑') {
              elems[i].style.display = 'block';
          } else {
                elems[i].style.display = 'none';
          }
      }

      if (event.target.innerText === '↓') {
        console.log("entra")
        event.target.innerHTML = '↑';
      } else {
        console.log("esce")
        event.target.innerHTML = '↓';
      }
    });
    itemDiv.appendChild(buttonToggle);


    // Append the item to the container
    element.appendChild(itemDiv);

    for(const pathName in item.paths) {
      const wrapper = document.createElement('div');
      wrapper.classList.add('wrapper-'+id);
      const nameDiv = document.createElement('div');
      nameDiv.textContent = pathName;
      const spanArrow = document.createElement('span');
        spanArrow.innerHTML = '&#x2193';
        spanArrow.classList.add("buttonToggle")
        spanArrow.addEventListener('click', (event) => {
        const elems = document.getElementsByClassName(`${pathName}-${id}`)
          for (let i = 0; i < elems.length; i++) {
            if (event.target.innerHTML === '↑') {
              elems[i].style.display = 'block';
            } else {
              elems[i].style.display = 'none';
            }
          }

          if (event.target.innerHTML === '↓') {
            event.target.innerHTML = '↑';
          } else {
            event.target.innerHTML = '↓';
          }
      });
      nameDiv.appendChild(spanArrow);
      nameDiv.classList.add('name');
      nameDiv.classList.add('name-' + id);
      wrapper.appendChild(nameDiv);

      const coordsDiv = document.createElement('div');
      coordsDiv.classList.add('coordinates');
      coordsDiv.classList.add(pathName + '-' + id);

      item.paths[pathName].forEach((coord, index) => {
        const coordDiv = document.createElement('div');
        coordDiv.classList.add('coordinate');

        // Index
        const indexDiv = document.createElement('div');
        indexDiv.textContent = index + 1;
        indexDiv.classList.add('index');
        indexDiv.onclick = async () => {
            if(tryingDelete) {
              await OBR.scene.items.updateItems([id], (items) => {
                const item = items[0];
                item.metadata[`${ID}/path`][pathName].splice(index, 1);
              }).then(() => {
                renderList();
              });
              tryingDelete = false
            }
        }

        // X and Y
        const xSpan = document.createElement('span');
        xSpan.textContent = 'X';
        const xInput = createInput('x', coord.x, id, index, pathName);
        const ySpan = document.createElement('span');
        ySpan.textContent = 'Y';
        const yInput = createInput('y', coord.y, id, index, pathName);

        // Rotation and Time
        const rotationSpan = document.createElement('span');
        rotationSpan.textContent = 'Rot.';
        const rotationInput = createInput('rotation', coord.rotation, id, index, pathName);
        const timeSpan = document.createElement('span');
        timeSpan.textContent = 'Time';
        const timeInput = createInput('time', coord.time, id, index, pathName);

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
        const image = document.createElement('img');
        image.src = "./public/mouse.svg"
        image.classList.add("mouse")
        // Add click listener to the image
        image.onclick = async () => {;
          const nowItem = await OBR.scene.items.getItems([id]);
          const xNow = nowItem[0].position.x;
          const yNow = nowItem[0].position.y;
          const rotNow = nowItem[0].rotation;
          const waitChange = setInterval(async () => {
            const items = await OBR.scene.items.getItems([id]);
            const item = items[0];
            const x = item.position.x;
            const y = item.position.y;
            const rot = item.rotation;
            if (x !== xNow || y !== yNow || rot !== rotNow) {
              // Update the x and y values in owlbear path
              await OBR.scene.items.updateItems([id], (items) => {
                const item = items[0];
                const path = item.metadata[`${ID}/path`][pathName];
                path[index].x = item.position.x;
                path[index].y = item.position.y;
                path[index].rotation = item.rotation;
              }).then(() => {
                renderList();
              });

              clearInterval(waitChange);
            }
          }, 500); // Wait 500ms to recheck


        };

        space.appendChild(image);
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

      const divArragment = document.createElement('div');
      const buttonAdd = document.createElement('button');
      buttonAdd.textContent = 'Add';
      buttonAdd.addEventListener('click', () => {
        OBR.scene.items.updateItems([id], (items) => {
          const item = items[0];
          item.metadata[`${ID}/path`][pathName].push({
            x: item.position.x,
            y: item.position.y,
            rotation: item.rotation,
            time: 0
          });
        }).then(() => {
          renderList();
        });
      });
      divArragment.appendChild(buttonAdd);
      divArragment.classList.add('buttonMove');
      const buttonRemove = document.createElement('button');
      buttonRemove.textContent = 'Remove';
      buttonRemove.addEventListener('click', (event) => {
        if (tryingDelete) {
          event.target.innerText = "Delete"
        } else {
          event.target.innerText = "Select.."
        }
        tryingDelete = !tryingDelete
      });
      divArragment.appendChild(buttonRemove);
      coordsDiv.appendChild(divArragment);


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
      wrapper.appendChild(coordsDiv);
      element.appendChild(wrapper);
    }


  }


};


// Function to create input elements for x, y, and time
function createInput(type, value, id, index, pathName) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = value;
  input.dataset.id = id; // Store the id for reference
  input.dataset.index = index; // Store the index for reference
  input.dataset.type = type; // Store the type (x, y, time)
  input.dataset.pathName = pathName; // Store the path name

  // Add event listener to track when the input changes
  input.addEventListener('input', handleInputChange);

  return input;
}

// Function to handle input changes
function handleInputChange(event) {
  const input = event.target;
  const id = input.dataset.id;
  const index = input.dataset.index;
  const pathName = input.dataset.pathName;
  const type = input.dataset.type;
  const newValue = input.value;

  // Update the corresponding data in the dictionary
  // Update items metadata with owlbear
  OBR.scene.items.updateItems([id], (items) => {
    const item = items[0];
    console.log(index)
    const path = item.metadata[`${ID}/path`];
    console.log(path)
    path[pathName][index][type] = newValue;
  });
}

