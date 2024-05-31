// ========================
// ==       Globals      ==
// ========================

// Our input fields
const width_input = document.getElementById('width');       
const height_input = document.getElementById('height');

const tile_size = 32;   // How big is each tile in pixels?
const open = 1;         // A constant for an open tile.
const closed = 0;       // A constant for a closed tile.

// The image file names to display our maze
const closed_tile_img = 'closed.png'  
const open_tile_img = 'open.png' 

let maze = []

// ========================
// ==    Maze Creation   ==
// ========================

function create_maze() {
    // Get all the settings for our maze
    const width = parseInt(width_input.value);
    const height = parseInt(height_input.value);

    // Reset our maze with solid blocks
    maze = create_2d_array(width, height, closed);

    // Figure out where to start
    let start_x = random_int(1, width-1);
    let start_y = random_int(1, height-1);
    
    start_x = set_to_odd(start_x);
    start_y = set_to_odd(start_y);

    // Recursively dig the starting location
    dig_around(start_x, start_y);

    create_egresses();

    // Render our new maze to the screen
    draw_maze();
}

function dig_around(x, y) {
    maze[y][x] = open;
    let neighbors = [
        {x: x-2, y: y  }, // Left
        {x: x+2, y: y  }, // Right
        {x: x,   y: y-2}, // Up
        {x: x,   y: y+2}  // Down
    ]
    neighbors = shuffle_array(neighbors)

    neighbors.forEach(neighbor => {
        dig_to(neighbor.x, neighbor.y, x, y)
    })
}

// Digs between two tiles. Must have not already been dug.
function dig_to(dest_x, dest_y, from_x, from_y) {
    let mid_x = (dest_x + from_x)/2;
    let mid_y = (dest_y + from_y)/2;

    // If its not within the map, don't go further.
    if (!is_within_map(dest_x, dest_y)) {
        return;
    }

    // If we haven't already dug in this direction.
    let dest = maze[dest_y][dest_x]
    let mid = maze[mid_y][mid_x]
    if (dest == closed && mid == closed) {
        // Then dig to it
        maze[dest_y][dest_x] = open;
        maze[mid_y][mid_x] = open;

        // Then try to dig the neighors of our new spot
        dig_around(dest_x, dest_y);
    }
}

function is_within_map(x, y) {
    return (x >= 0 &&   // Checking left
        y >= 0 &&       // Checking up
        x < maze[0].length &&  // Checking right
        y < maze.length        // Checking down
    )
}

// Creates an entrance and exit.
function create_egresses() {
    let entrance, exit;
    // Check if we should do left and right, or up and down
    if (random_coin()) {
        // Add the entrance and exit left and right.
        entrance = {
            x: 0,
            y: random_int(1, maze.length-1)
        }
        exit = {
            x: maze[0].length-1,
            y: random_int(1, maze.length-1)
        }
        entrance.y = set_to_odd(entrance.y)
        exit.y = set_to_odd(exit.y)
    } else {
        // Add the entrance and exit up and down
        entrance = {
            x: random_int(1, maze[0].length-1),
            y: 0 
        }
        exit = {
            x: random_int(1, maze[0].length-1),
            y: maze.length-1
        }
        entrance.x = set_to_odd(entrance.x)
        exit.x = set_to_odd(exit.x)
    }
    try {
        maze[entrance.y][entrance.x] = open;
        maze[exit.y][exit.x] = open;
    } catch (e) {
        console.error(e)
        console.log(entrance, exit)
    }
}

// ========================
// ==    Maze Drawing    ==
// ========================

function draw_maze() {
    const container = document.getElementById('maze_display')

    // Clear out any previous maze
    container.innerHTML = ""

    // Go row by row
    for (let y = 0; y < maze.length; y++) {
        // Go through each tile in the row
        for (let x = 0; x < maze[y].length; x++) {
            // We need to determine whether this is a closed
            // or open image
            let image_name;
            let tile = maze[y][x];
            if (tile == closed) {
                image_name = closed_tile_img;
            } else { // Tile is open
                image_name = open_tile_img;
            }

            let element = document.createElement('img')
            element.src = image_name;
            container.appendChild(element)
        }
        let br = document.createElement('br')
        container.appendChild(br)
    }
}

// ========================
// ==    Maze Download   ==
// ========================

// Converts the maze to a text format, then sends the file 
// as a download to the user.
function download_maze() {
    // Create string of text data
    let data = ""
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            data += maze[y][x]
        }
        data += "\n"
    }

    // Create the download
    const blob = new Blob([data], {type: 'text'});
    const element = document.createElement('a')
    element.href = window.URL.createObjectURL(blob);
    element.download = 'maze.txt'
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// ========================
// ==  Helper Functions  ==
// ========================

// Gets a number between min and max exclusively.
// So if 0 and 10 are passed in for min and max, then
// you'll get anything from 0 to 9.
function random_int(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

// Returns either true or false randomly. 
// Essentially flips a coin.
function random_coin() {
    return Math.random() > 0.5;
}

// Shuffle an array using the Fisher-Yates Sorting Algorithm
function shuffle_array(array) {
    // Copy our original array, so we don't mutate the original
    let copy = [];
    for (let i = 0; i < array.length; i++) {
        copy.push(array[i])
    }

    // Run through each card, randomly swapping it with another
    for (let i = 0; i < copy.length; i++) {
        let random_spot = random_int(0, copy.length);
        
        // Perform the swap
        let temp = copy[random_spot]
        copy[random_spot] = copy[i]
        copy[i] = temp;
    }

    return copy;
}

// Creates an empty 2D array filled with whichever is 
// passed in for "fill_with"
function create_2d_array(width, height, fill_with) {
    let array = []
    for (let y = 0; y < height; y++) {
        let row = []
        for (let x = 0; x < width; x++) {
            row.push(fill_with)
        }
        array.push(row)
    }
    return array
}

// Ensures a number is odd. 
// If 0, then it will be set to 1.
// If 1, then it stays 1
function set_to_odd(number) {
    return (number % 2 == 1) ? number : number + 1
}