document.addEventListener("DOMContentLoaded", function(){


// CLOCK

function updateClock(){

const clock =
document.getElementById("clock");


if(clock){

clock.textContent =
new Date().toLocaleTimeString();

}

}


updateClock();

setInterval(updateClock,1000);






// CHECK COUNTRY DATA

if(!window.countryData){

alert("Countries.js not loaded");

return;

}






// MAP

const map =
L.map("map").setView([20,0],2);



L.tileLayer(

"https://tile.openstreetmap.org/{z}/{x}/{y}.png",

{

attribution:"© OpenStreetMap"

}

).addTo(map);






// WEATHER LAYERS

const temperatureLayer =
L.tileLayer(

"https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=YOUR_API_KEY"

);



const cloudsLayer =
L.tileLayer(

"https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=YOUR_API_KEY"

);



const rainLayer =
L.tileLayer(

"https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=YOUR_API_KEY"

);





L.control.layers(

{

"🌍 Normal Map":

L.tileLayer(
"https://tile.openstreetmap.org/{z}/{x}/{y}.png"
)

},

{

"🌡️ Temperature":
temperatureLayer,


"☁️ Clouds":
cloudsLayer,


"🌧️ Rain":
rainLayer

}

).addTo(map);






// LOAD WORLD MAP

fetch("World.geojson")

.then(response=>response.json())

.then(data=>{


L.geoJSON(data,{

style:{

color:"#fff",

weight:1,

fillOpacity:0.25

},


onEachFeature:(feature,layer)=>{


layer.on("click",()=>{


let name =
feature.properties.name ||
feature.properties.ADMIN;



let country =
Object.values(window.countryData)
.find(c=>

c.name.toLowerCase()
.includes(name.toLowerCase())

);



if(country){

showCountry(country);

}


});



}


}).addTo(map);



});

// COUNTRY MARKERS


Object.values(window.countryData)
.forEach(country=>{


if(country.lat && country.lng){


let marker =

L.marker([

country.lat,

country.lng

])

.addTo(map);



marker.on("click",()=>{


showCountry(country);


});


}


});









// SHOW COUNTRY INFORMATION


function showCountry(country){



document.getElementById("countryName").textContent =

country.flag+" "+country.name;



document.getElementById("countryPopulation").textContent =

country.population;



document.getElementById("capital").textContent =

country.capital;



document.getElementById("region").textContent =

country.region;



document.getElementById("currency").textContent =

country.currency;



document.getElementById("area").textContent =

country.area || "N/A";



document.getElementById("language").textContent =

country.language || "N/A";



document.getElementById("timezone").textContent =

country.timezone || "N/A";



document.getElementById("code").textContent =

country.code || "N/A";





updateLocalTime(country.timezone);



getWeather(

country.lat,

country.lng

);



map.setView(

[

country.lat,

country.lng

],

5

);



}









// WEATHER API (FREE)


async function getWeather(lat,lng){


try{


let response =

await fetch(

`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,windspeed_10m&timezone=auto`

);



let data =

await response.json();





let current = data.current;



document.getElementById("temperature").textContent =

current.temperature_2m+" °C";




document.getElementById("wind").textContent =

current.windspeed_10m+" km/h";




document.getElementById("weather").textContent =

"Live weather";




if(document.getElementById("humidity")){


document.getElementById("humidity").textContent =

current.relative_humidity_2m+"%";


}



if(document.getElementById("rain")){


document.getElementById("rain").textContent =

current.precipitation+" mm";


}


}

catch(error){

console.log(
"Weather error:",
error
);

}


}









// LOCAL TIME


function updateLocalTime(timezone){


if(!timezone){

return;

}



try{


document.getElementById("localTime").textContent =


new Date().toLocaleTimeString(

"en-US",

{

timeZone: timezone

}

);



}

catch(e){


document.getElementById("localTime").textContent =

"N/A";


}


}

// ===============================
// REAL GLOBAL DATA
// ===============================


let globalPopulation = 0;

let birthRate = 0;

let deathRate = 0;

let forestArea = 0;





// LOAD REAL POPULATION FROM WORLD BANK


async function loadGlobalPopulation(){


try{


let response = await fetch(

"https://api.worldbank.org/v2/country/WLD/indicator/SP.POP.TOTL?format=json"

);



let data = await response.json();



globalPopulation =

data[1][0].value;




document.getElementById("population").textContent =

Number(globalPopulation)
.toLocaleString();



}

catch(error){


console.log(
"Population API error:",
error
);


}


}







// GLOBAL BIRTH AND DEATH ESTIMATE


function startGlobalCounters(){



// Approximate global yearly rates

let yearlyBirths = 135000000;


let yearlyDeaths = 62000000;



birthRate =
yearlyBirths / (365*24*60*60);



deathRate =
yearlyDeaths / (365*24*60*60);







setInterval(()=>{



globalPopulation +=

birthRate - deathRate;



let birthsElement =
document.getElementById("births");



let deathsElement =
document.getElementById("deaths");



let populationElement =
document.getElementById("population");





if(birthsElement){

birthsElement.textContent =

Math.floor(
birthRate
)
+
" / sec";


}





if(deathsElement){

deathsElement.textContent =

Math.floor(
deathRate
)
+
" / sec";


}





if(populationElement){


populationElement.textContent =

Math.floor(globalPopulation)
.toLocaleString();


}



},1000);


}









// FOREST DATA (WORLD BANK)


async function loadForestData(){


try{


let response = await fetch(

"https://api.worldbank.org/v2/country/WLD/indicator/AG.LND.FRST.ZS?format=json"

);



let data = await response.json();



forestArea = data[1][0].value;



let treeElement =
document.getElementById("trees");



if(treeElement){


treeElement.textContent =

forestArea+"% forest coverage";


}



}

catch(error){


console.log(
"Forest API error:",
error
);


}


}







// START REAL DATA


loadGlobalPopulation();


loadForestData();


startGlobalCounters();

// ===============================
// REAL DATA CHART
// ===============================


const ctx =

document.getElementById("worldChart");



let worldChart = null;



if(ctx && typeof Chart !== "undefined"){



worldChart = new Chart(ctx,{


type:"line",



data:{


labels:[],



datasets:[



{

label:"🌎 Population",

data:[],

borderColor:"#38bdf8",

backgroundColor:

"rgba(56,189,248,.2)",

tension:.4


},




{

label:"🌳 Forest Coverage",

data:[],

borderColor:"#22c55e",

tension:.4


}


]

},




options:{


responsive:true,



plugins:{


legend:{


labels:{


color:"white"


}


}


},



scales:{


x:{


ticks:{


color:"white"


}


},



y:{


ticks:{


color:"white"


}


}



}



}



});


}









// UPDATE CHART WITH REAL VALUES


setInterval(()=>{


if(worldChart && globalPopulation){



worldChart.data.labels.push(

new Date()
.toLocaleTimeString()

);



worldChart.data.datasets[0]
.data.push(

Math.floor(globalPopulation)

);



worldChart.data.datasets[1]
.data.push(

forestArea || 0

);







if(worldChart.data.labels.length > 10){


worldChart.data.labels.shift();



worldChart.data.datasets.forEach(dataset=>{


dataset.data.shift();


});


}



worldChart.update();


}



},5000);











// ===============================
// GLOBAL CLIMATE DASHBOARD
// ===============================


async function loadGlobalClimate(){


try{


// Nairobi example coordinates
// can be changed later


let response = await fetch(

"https://api.open-meteo.com/v1/forecast?latitude=-1.286389&longitude=36.817223&current=temperature_2m,relative_humidity_2m,precipitation,windspeed_10m"

);



let data = await response.json();



let current = data.current;




if(document.getElementById("globalTemp")){


document.getElementById("globalTemp").textContent =

current.temperature_2m+" °C";


}





if(document.getElementById("humidity")){


document.getElementById("humidity").textContent =

current.relative_humidity_2m+"%";


}





if(document.getElementById("rain")){


document.getElementById("rain").textContent =

current.precipitation+" mm";


}





if(document.getElementById("globalWind")){


document.getElementById("globalWind").textContent =

current.windspeed_10m+" km/h";


}





}

catch(error){


console.log(
"Climate error:",
error
);


}



}



loadGlobalClimate();

// ===============================
// COUNTRY SEARCH
// ===============================


window.searchCountry = function(){


let text =

document.getElementById("countrySearch")
.value
.toLowerCase();



let country =

Object.values(window.countryData)
.find(c =>

c.name
.toLowerCase()
.includes(text)

);




if(country){


showCountry(country);


}

else{


alert("Country not found");


}



};









// ===============================
// WORLD RANKINGS
// ===============================


function loadRankings(){



if(!window.countryData){

return;

}




let countries =

Object.values(window.countryData);






// CONTINENT POPULATION


let continents = {};




countries.forEach(country=>{



let region =

country.region || "Other";




let population =

parseInt(

country.population
.toString()
.replace(/,/g,"")

);




if(!continents[region]){


continents[region]=0;


}



continents[region]+=population;



});







let continentBox =

document.getElementById("continentStats");




if(continentBox){


let html="";



Object.keys(continents)
.forEach(region=>{


html += `


<div class="card">


<h3>
🌍 ${region}
</h3>


<p>

Population:

${continents[region]
.toLocaleString()}

</p>


</div>


`;


});



continentBox.innerHTML = html;


}








// TOP COUNTRIES


countries.sort((a,b)=>{


let popA =

parseInt(

a.population
.toString()
.replace(/,/g,"")

);



let popB =

parseInt(

b.population
.toString()
.replace(/,/g,"")

);



return popB-popA;


});







let topBox =

document.getElementById("topCountries");




if(topBox){



let html="";




countries.slice(0,10)
.forEach((country,index)=>{



html += `


<div class="card country-ranking"

onclick="openRankingCountry('${country.name}')">



<h3>

${index+1}.

${country.flag}

${country.name}

</h3>



<p>

👥 ${country.population}

</p>



<p>

🌍 ${country.region}

</p>



</div>


`;


});



topBox.innerHTML = html;



}



}









// OPEN COUNTRY FROM RANKING


window.openRankingCountry=function(name){



let country =

Object.values(window.countryData)
.find(c=>

c.name === name

);



if(country){


showCountry(country);


}



};









// START RANKINGS


loadRankings();





});
