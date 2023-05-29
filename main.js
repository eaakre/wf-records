// Inside the google sheets url
let SHEET_ID = '1U-JMf_a4SzvZ0G3Dpi9qKJTcIAroJd5CIpFl_RZiPNM';

// Name of each workbook - should change based on drop-down
let SHEET_TITLE = 'Mens 100';

// Will only select the top 50 athletes in each event.
// Have had problems when adding new times to events. There 
// needs to be 50 athletes max in the Google Sheets workbook
let SHEET_RANGE = 'A1:C51';

// Divs for dropdown menus
const selectedGender = document.getElementById('gender-select');
const selectedEvent = document.getElementById('event-select');
const selectedList = document.getElementById('list-select');
const goBtn = document.getElementById('go-button');
const eventTitle = document.getElementById('event-title');
const girls100H = document.getElementById('100H');
const boys110H = document.getElementById('110H');

// Update Event dropdown menu for 100/110 Hurdles
selectedGender.addEventListener('change', function(){
  if (selectedGender.value == "Womens") {
    girls100H.style.display = 'block';
    boys110H.style.display = 'none';
  } else {
    girls100H.style.display = 'none';
    boys110H.style.display = 'block';
  }
})

// Divs to fill with records
const gridData = document.getElementById('grid-data')
const nameTitle = document.getElementById('name-title');
const yearTitle = document.getElementById('year-title');
const timeTitle = document.getElementById('time-title');

// Click the "Go!" button
goBtn.addEventListener('click', function(){
  let newSheet = selectedGender.value + ' ' + selectedEvent.value
  
  // newRange will be used to display top 10, 25, and 50
  let newRange = Number(selectedList.value) + 1;

  // When using times for 800+ meters, the time format doesn't sort well
  // sprints use the first sort method in the loadList function
  // Need to differentiate between sprints/distance/field
  let sprint = true;
  if (selectedEvent.value == 800 || selectedEvent.value == 1600 || selectedEvent.value == 3200) {
    sprint = false;
  }

  // call loadList function.
  loadList(newSheet, sprint)
})

function loadList(newEvent, sprint) {
  // Change workbooks in Google Sheets 
  SHEET_TITLE = newEvent

  // Reset any records previously looked at back to empty
  nameTitle.innerHTML = ''
  yearTitle.innerHTML = ''
  timeTitle.innerHTML = ''

  // Replace H1 tag with selected event
  eventTitle.innerHTML = newEvent;
  while (gridData.hasChildNodes()) {
    gridData.removeChild(gridData.firstChild);
  }

  // full URL using selected gender, event, and range
  // range is always set to A1:C51 - make sure to only have 50 athletes included
  // otherwise sort feature will leave out the athletes added most recently. 
  let FULL_URL = ('https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?sheet=' + SHEET_TITLE + '&range=' + SHEET_RANGE);

  // Got a lot of help from this video - to parse through Google Sheets
  // https://www.youtube.com/watch?v=vtq2xTWK7h4
  fetch(FULL_URL)
  .then(res => res.text())
  .then(rep => {
    // Gets rid of the beginning and end characters so that the JSON is useable
    let data = JSON.parse(rep.substr(47).slice(0,-2));
    
    // Set titles for each column on the index.html page
    nameTitle.innerHTML = data.table.cols[0].label
    yearTitle.innerHTML = data.table.cols[1].label
    timeTitle.innerHTML = data.table.cols[2].label

    // Sort array so that the records are in order
    let array = data.table.rows;

    // If it is a sprint (100, 200, 400)
    // anything around a minute or less...this should include 4x100 relay
    // Need to differentiate between sprints/distance/field
    if (sprint) {
      array.sort((a, b) => {
        return parseFloat(a.c[2].v) - parseFloat(b.c[2].v)
      })
    } else {
      // for the distance events...this should also include relays that will last longer than a minute
      array.sort((a, b) => {
        return a.c[2].v.localeCompare(b.c[2].v)
      });
    }

    // loop through the array and append into the records div
    for(let i=0; i<selectedList.value; i++){
      let newBoxRank = document.createElement('div');
      newBoxRank.id = ('row'+i);
      newBoxRank.className = 'row';
      newBoxRank.innerHTML = i + 1 + ".";
      gridData.append(newBoxRank)

      // loop through names
      let newBoxName = document.createElement('div');
      newBoxName.id = ('row'+i);
      newBoxName.className = 'row';
      newBoxName.innerHTML = array[i].c[0].v
      gridData.append(newBoxName)
    
      // loop through years
      let newBoxYear = document.createElement('div');
      newBoxYear.id = ('row'+i);
      newBoxYear.className = 'row';
      newBoxYear.innerHTML = array[i].c[1].v
      gridData.append(newBoxYear)

      // loop through times
      let newBoxTime = document.createElement('div');
      newBoxTime.id = ('row'+i);
      newBoxTime.className = 'row';
      newBoxTime.innerHTML = array[i].c[2].v
      gridData.append(newBoxTime)
    }
  })
}
