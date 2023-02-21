const carCanvas=document.getElementById("carCanvas");
carCanvas.width=200;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=800;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const lanes = 3;

const DUMMY_CAR_SPEED = 2;

const road=new Road(carCanvas.width/2,carCanvas.width*0.9, lanes);

let frame = 0;

const N = 100;
const Nt = 1000;
const cars=generateCars(N);
let bestCar=cars[0];
if(localStorage.getItem("bestBrain")){
    for(let i=0;i<cars.length;i++){
        cars[i].brain=JSON.parse(
            localStorage.getItem("bestBrain"));
        if(i!=0){
            NeuralNetwork.mutate(cars[i].brain,0.035);
        }
    }
}

function generateTraffic(Nt){
    let traffic = [
        new Car(road.getLaneCenter(1),-100,30,50,"DUMMY",DUMMY_CAR_SPEED,getRandomColor()),
        new Car(road.getLaneCenter(0),-300,30,50,"DUMMY",DUMMY_CAR_SPEED,getRandomColor()),
        new Car(road.getLaneCenter(2),-300,30,50,"DUMMY",DUMMY_CAR_SPEED,getRandomColor()),
        new Car(road.getLaneCenter(0),-500,30,50,"DUMMY",DUMMY_CAR_SPEED,getRandomColor()),
        new Car(road.getLaneCenter(1),-500,30,50,"DUMMY",DUMMY_CAR_SPEED,getRandomColor()),
        new Car(road.getLaneCenter(1),-700,30,50,"DUMMY",DUMMY_CAR_SPEED,getRandomColor()),
        new Car(road.getLaneCenter(2),-700,30,50,"DUMMY",DUMMY_CAR_SPEED,getRandomColor())
    ];
    
    for(let i = 0; i < Nt; i++){
        let temp = null;
        for(let j = 0; i < Math.floor(Math.random() * 3); i++){
            if(temp == null){
                temp = Math.floor(Math.random() * 3);
                traffic.push(new Car(road.getLaneCenter(temp), (-1 * i * (Math.random() * 50 + 75)) - 100, 30, 50, "Dummy", DUMMY_CAR_SPEED, getRandomColor()));
            }else{
                let temp2 = Math.floor(Math.random() * 3);
                while(temp2 != temp){
                    let temp2 = Math.floor(Math.random() * 3);
                }
                traffic.push(new Car(road.getLaneCenter(temp2)));
            }
        }
    }

    return traffic;
}
const traffic= generateTraffic(Nt);

animate();

function save(){
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
}

function discard(){
    localStorage.removeItem("bestBrain");
}

function generateCars(N){
    const cars=[];
    for(let i=1;i<=N;i++){
        cars.push(new Car(road.getLaneCenter(1),100,30,50,"AI"));
    }
    return cars;
}

function animate(time){
    const start = Date.now();
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]);
    }
    for(let i=0;i<cars.length;i++){
        cars[i].update(road.borders,traffic, frame);
        if(bestCar.highScore<cars[i].score){
            bestCar=cars[i];
        }
    }

    carCanvas.height=window.innerHeight;
    networkCanvas.height=window.innerHeight;

    carCtx.save();
    carCtx.translate(0,-bestCar.y+carCanvas.height*0.7);

    road.draw(carCtx);
    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(carCtx);
    }
    carCtx.globalAlpha=0.2;
    for(let i=0;i<cars.length;i++){
        cars[i].draw(carCtx);
    }
    carCtx.globalAlpha=1;
    bestCar.draw(carCtx,true);

    carCtx.restore();

    frame++;
    const end = Date.now();
    console.log("current score:" + bestCar.score + "\nhigh score:" + bestCar.highScore + "\npoints per frame:" + Math.abs(bestCar.score)/frame);
    console.log(bestCar.brain);
    console.log(end-start + "ms per frame");
    console.log(1000 / (end-start) + " frames per second");

    networkCtx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(networkCtx,bestCar.brain);
    requestAnimationFrame(animate);
}