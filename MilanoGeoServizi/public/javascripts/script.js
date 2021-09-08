let serverIP="127.0.0.1";
const negoziStoriciGetReq = {
  method: 'GET',
  url: 'https://www.dati.lombardia.it/resource/pccq-vbbq.json',
  asynchronous: true
}
const wifiAPGetReq = {
  method: 'GET',
  url: 'https://www.dati.lombardia.it/resource/ny3p-f7jd.json',
  asynchronous: true
}
const puntiParcoAgricoloSudMilanoGetReq = {
  method: 'GET',
  url: 'https://www.dati.lombardia.it/resource/ejc4-m7dx.json',
  asynchronous: true
}
const museiMilanoGetReq = {
  method: 'GET',
  url: 'https://www.dati.lombardia.it/resource/seen-dpws.json',
  asynchronous: true
}
const struttureRicettiveMilanoGetReq = {
  method: 'GET',
  url: 'https://www.dati.lombardia.it/resource/t9pt-x49i.json',
  asynchronous: true
}
let nodeGetReq = {
  method: 'GET',
  url: '',
  asynchronous: true
}

let CommentPostReq = {
  url: '',
  parameterString: '',
  asynchronous: true
}

const starsLayout ={
  starwrap: '<div></div>',
  starChecked: '<i class="fa fa-star checked"></i>',
  starUnchecked:'<i class="fa fa-star unchecked"></i>'
  }


//get the modal Header
const modalHeader=document.getElementById("summary");

//get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

//CreateGetRequest(LombardiaGetReq, initMap, drawMap);
CreateGetRequest(negoziStoriciGetReq, drawMap, initMap);

// funzione per fare chiamate get, con due funzioni di callback a cui passa la risposta del server
function CreateGetRequest(call, callback1, callback2){
  //localStorage.clear();
  let xhttpr = new XMLHttpRequest(); // LombardiaGetReq

  xhttpr.onreadystatechange = function(){
	   if(xhttpr.readyState === 4){
		     if(xhttpr.status === 200){
			        callback1(xhttpr.response);

              callback2(xhttpr.response);
		          }
          else {
              let message = document.createTextNode('Error getting the data!');

              }
	       }
  }

  xhttpr.open(call.method,call.url,call.asynchronous); // HTTP call

  xhttpr.send(); // send the request to the server
}

// funzione per fare chiamate post, con una funzione di callback
function CreatePostRequest(call, callback){

  let xhttpr = new XMLHttpRequest();

  xhttpr.onreadystatechange = function(){
	   if(xhttpr.readyState === 4){
		     if(xhttpr.status === 200){
			        callback(xhttpr.response);
		          }
          else {
            console.log("Error getting the data")
              }
	       }
  }

  xhttpr.open('POST',call.url,call.asynchronous); // HTTP call

  xhttpr.send(call.parameterString); // send the request to the server
}

function drawMap(response){

    let resp = JSON.parse(response);
    let locations = [];
    let labels = [];

    function extract(item){
      //if(item.location_1){

        let coor = {};

         if(item.hasOwnProperty("location")){
          coor.lat = JSON.parse(item.location.latitude);
          coor.lng = JSON.parse(item.location.longitude);
          locations.push(coor);
          if (item.hasOwnProperty("denominazione_sede")){
              labels.push(item.denominazione_sede);
          }
          else if (item.hasOwnProperty("denominazione_struttura")){
            labels.push(item.denominazione_struttura);
          }
          else if (item.hasOwnProperty("denom_impres")){
            labels.push(item.denom_impres);
          }
        }

        else if(item.hasOwnProperty("location_1")){
          coor.lat = JSON.parse(item.location_1.latitude);
          coor.lng = JSON.parse(item.location_1.longitude);
          locations.push(coor);
          if (item.hasOwnProperty("denominazione_punto")){
              labels.push(item.denominazione_punto);
          }
          else{
            labels.push(item.sito);
          }
        }

    };
    resp.forEach(extract);
    //console.log(locations);
   if(locations.length!=0){    // Se non è vuoto
    locations = JSON.stringify(locations);
    localStorage.setItem("locations", locations);
    labels = JSON.stringify(labels);
    localStorage.setItem("labels", labels);
  };
}

function initMap() {      //Create map from locations saved in LocalStorage


       // Inizializza mappa
       var map = new google.maps.Map(document.getElementById('map'),{
         zoom: 10,
         center: {lat: 45.464664, lng: 9.188540}
       });

       // Leggere le locations salvate in localStorage da drawMap
       let locations = localStorage.getItem("locations");
       locations = JSON.parse(locations);
       //console.log(locations);


       let labels = localStorage.getItem("labels");
       labels = JSON.parse(labels);

       var markers = locations.map(function(location, i) {
           MyMarker=new google.maps.Marker({
             position: location,
             label: labels[i % labels.length]
           });
//event on marker click
           MyMarker.addListener('click', function(temp) {
            map.setCenter(this.getPosition());
            CreateModal(this.label);
           });
           return MyMarker;
         });



       // Add a marker clusterer to manage the markers.
       var markerCluster = new MarkerClusterer(map, markers,
       {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
     }
     function CreateModal(apname){

       nodeGetReq.url='http://'+serverIP+':3000/getapdata/?apname='+escape(apname);   //Escape special characters and send by http
       CreateGetRequest(nodeGetReq,getData,viewData);

       function getData(data){
         document.getElementById("getAPName").value=apname;
          modal.style.display = "block";
      }

      //When the user clicks anywhere outside of the modal, close it
      window.onclick = function(event) {
        if (event.target == modal) {
          modal.style.display = "none";
          clear();
        }
      }
      // When the user clicks on <span> (x), close the modal
      span.onclick = function() {
        modal.style.display = "none";
        clear();
      }

     }
     function viewData(data){
        let commentsAmount=0;
        let ratingSum=0;
         jdata=JSON.parse(data);
         switchStars();             //Create interactive stars
         let apname = document.createTextNode(document.getElementById("getAPName").value);

         function extract(item){
         commentsAmount++;
         targ=document.getElementById("entry");     //Get review and append to entry
         let wrap = document.createElement('p');
         wrap.setAttribute("class", "commentBox");
         let bodyWrap = document.createElement('p');
         bodyWrap.setAttribute("class", "bodyText");
         let authorWrap = document.createElement('p');
         authorWrap.setAttribute("class", "author");
         let dateWrap = document.createElement('p');
         dateWrap.setAttribute("class", "date");

         let textCont = document.createTextNode(JSON.parse(JSON.stringify(item.text)));
         let author =  document.createTextNode(JSON.parse(JSON.stringify(item.user)));
         let datetext = JSON.stringify(item.date);
         datetext=datetext.replace("T", " ");   //Convert MySQL DateTime format to normal date and time
         datetext=datetext.replace(".000Z", "");
         datetext=JSON.parse(datetext);
         let date = document.createTextNode(datetext);
         let rating=item.rating;
         ratingSum+=rating;
         targ.appendChild(wrap);
         wrap.appendChild(authorWrap).appendChild(author);
         displayStars(wrap,rating); //Display stars for each comment
         wrap.appendChild(dateWrap).appendChild(date);
         wrap.appendChild(bodyWrap).appendChild(textCont);
       }
       jdata.forEach(extract);        //Display each comment from the db response
       let summaryWrap = document.createElement('p');
       summaryWrap.setAttribute("id","modalTitle");
       modalHeader.appendChild(summaryWrap).appendChild(apname);    //Write Header
       displayStars(modalHeader,ratingSum/commentsAmount);          //Display overall rating
     }

     function displayStars(targ,stars){   //Display given number of stars and append to targ
       let starsWrap=document.createElement('span');
       starsWrap.setAttribute("class", "stars");
       for(let i=1;i<=5;i++){

         if(i<=stars){
           starsWrap.insertAdjacentHTML( 'beforeend', starsLayout.starChecked);
         }
         else {
         starsWrap.insertAdjacentHTML( 'beforeend', starsLayout.starUnchecked);
         }
       }
       targ.appendChild(starsWrap);
     }

     function switchStars(){
     var list=["one","two","three","four","five"];
     list.forEach(function(element,currentStarIndex) {
       document.getElementById(element).addEventListener("click", function(){

        document.getElementById("getRating").value=currentStarIndex+1;
         list.forEach(function (star,index){
           let a=document.getElementById(star).className;
           if(index<=currentStarIndex){
             if(a.includes("unchecked")){                                              // Remove all stars
                document.getElementById(star).classList.remove("unchecked");
                document.getElementById(star).classList.add("checked");
              }
            }
            else{
              if(a.includes("checked")){                                              // Remove all stars
                 document.getElementById(star).classList.remove("checked");
                 document.getElementById(star).classList.add("unchecked");
               }
            }
         });
       });
     });
   }
   function clear(){
     targ=document.getElementById("entry");
     targ.innerHTML='';
     targ2=document.getElementById("summary");
     targ2.innerHTML='';
     resetStars();
     resetForm();

   }
   function resetForm(){
       document.getElementById("getRating").value="";

       document.getElementById("getUser").setAttribute("class","valid");

       document.getElementById("getUser").value="";
       document.getElementById("getComment").setAttribute("class","valid");
       document.getElementById("getComment").value="";
   }
   function resetStars(){
     var list=["one","two","three","four","five"];
     document.getElementById("starFormWrap").setAttribute("class","valid");
     list.forEach(function(element) {

           let a=document.getElementById(element).className;
             if(a.includes("checked")){                                              // Remove all stars
                document.getElementById(element).classList.remove("checked");
                document.getElementById(element).classList.add("unchecked");

              }
         });
     }

     function submitForm(){
       if (validateForm()==true){

              let user = JSON.parse(JSON.stringify(document.getElementById("getUser").value));
              let apname= JSON.parse(JSON.stringify(document.getElementById("getAPName").value));
              let text= JSON.parse(JSON.stringify(document.getElementById("getComment").value));
              let rating= JSON.parse(JSON.stringify(document.getElementById("getRating").value));
              function getData(data){
                document.getElementById("getAPName").value=apname;
             }
              //console.log(text);
          var xhr = new XMLHttpRequest();

          xhr.onreadystatechange = function(){
             if(xhr.readyState === 4){
                 if(xhr.status === 200){
                   viewData(xhr.response);
                      }
                  else {
                    console.log("Error getting the data")
                      }
                 }
          }

          xhr.open("POST", "http://"+serverIP+":3000/insertcomment",true);
          xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

            let stringa='user='+escape(user)+'&apname='+escape(apname)+'&comment='+escape(text)+'&rating='+escape(rating);
            xhr.send(stringa);

            clear();

            //CreateGetRequest(nodeGetReq,getData,viewData);


          }

        }

     function validateForm() {
       let user = document.forms["commentForm"]["user"].value;
       let rating = document.forms["commentForm"]["rating"].value;
       let comment = document.forms["commentForm"]["comment"].value;
       let apname = document.forms["commentForm"]["apname"].value;
       a=false;
       let labelsArray = localStorage.getItem("labels");
       labelsArray = JSON.parse(labelsArray);
       labelsArray.forEach(function(item){
          if(apname==item){
            a=true;
          }
        });

       if ((rating=="")||(rating<1)||(rating>5)) {
         document.getElementById("starFormWrap").setAttribute("class","invalid");


         alert("Rating cannot be empty!");
         a=false;
       }
       if (comment.length>500){
         document.getElementById("getComment").setAttribute("class","invalid");

         alert("Exceeded maximum comment length (500 characters)");
         a=false;
       }
       if (user=="") {
         document.getElementById("getUser").setAttribute("class","invalid");

         alert("Username cannot be empty!");
         a=false;
       }

       if (user.length>20){
         document.getElementById("getUser").setAttribute("class","invalid");
         alert("Exceeded maximum name length (20 characters)");
         a=false;
       }
       if (user.length<5){
         document.getElementById("getUser").setAttribute("class","invalid");
         alert("Username too short (min 4 characters)");
         a=false;
       }
      return a;
     }

function setColor(currentId){
  console.log(currentId);
  for(let a=0;a<=4;a++){
    if(a==currentId){
      document.getElementById(a).setAttribute("class","buttonPressed");
    }
    else{
      document.getElementById(a).setAttribute("class","buttonNotPressed");
    }
  }
}
