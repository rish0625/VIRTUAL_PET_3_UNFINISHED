var dog,sadDog,happyDog, database;
var foodS,foodStock;
var fedTime,lastFed;
var feed,addFood;
var foodObj;
var bedroomImage, gardenImage, washroomImage;
var gamestate, changeState, readState; 
var currentTime;

function preload(){
  sadDog=loadImage("Images/Dog.png");
  happyDog=loadImage("Images/happy dog.png");

  bedroomImage = loadImage("virtual pet images/Bed Room.png");
  gardenImage = loadImage("virtual pet images/Garden.png");
  washroomImage = loadImage("virtual pet images/Wash Room.png");
}

function setup() {
  database=firebase.database();
  createCanvas(1000,400);

  foodObj = new Food();

  foodStock=database.ref('Food');
  foodStock.on("value",readStock);
  
  dog=createSprite(800,200,150,150);
  dog.addImage(sadDog);
  dog.scale=0.15;
  
  feed=createButton("Feed the dog");
  feed.position(700,95);
  feed.mousePressed(feedDog);

  addFood=createButton("Add Food");
  addFood.position(800,95);
  addFood.mousePressed(addFoods);

  readState = database.ref("gamestate");
  readState.on("value", function(data){
    gameState = data.val();
  });
}

function draw() {
  background(46,139,87);
  foodObj.display();

  if(currentTime === lastFed + 1){
    foodObj.garden();
    gameState = "playing";
    update(gameState);
  } else if(currentTime === lastFed + 2){
    foodObj.bedroom();
    gameState = "sleeping";
    update(gameState);
  } else if(currentTime === lastFed + 3 || currentTime === lastFed + 4){
    foodObj.washroom();
    gameState = "bathing";
    update(gameState);
  } else {
    gameState = "hungry";
    foodObj.display();
  }

  fedTime=database.ref('FeedTime');
  fedTime.on("value",function(data){
    lastFed=data.val();
  });
 
  fill(255,255,254);
  textSize(15);
  if(lastFed>=12){
    text("Last Feed : "+ lastFed%12 + " PM", 350,30);
  } else if(lastFed==0){
     text("Last Feed : 12 AM",350,30);
  } else{
     text("Last Feed : "+ lastFed + " AM", 350,30);
  }

  if(gameState != "hungry"){
    feed.hide();
    addFood.hide();
  } else {
    feed.show();
    addFood.show();
  }

  drawSprites();
}

//function to read food Stock
function readStock(data){
  foodS=data.val();
  foodObj.updateFoodStock(foodS);
}


//function to update food stock and last fed time
function feedDog(){
  dog.addImage(happyDog);

  foodObj.updateFoodStock(foodObj.getFoodStock()-1);
  database.ref('/').update({
    Food:foodObj.getFoodStock(),
    FeedTime:hour()
  })
}

//function to add food in stock
function addFoods(){
  foodS++;
  database.ref('/').update({
    Food:foodS
  })
}

function update(state){
  database.ref("/").update({
    gamestate: state
  })
}