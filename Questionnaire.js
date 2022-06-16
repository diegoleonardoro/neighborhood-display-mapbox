import React, { useState, useEffect } from "react";
import "./Questionnaire.css";


import selectNeighborhood from "../../helper-functions/selectNeighborhood"
import {shakeElements, shakeSelectElement} from "../../helper-functions/invalidInputs"
import MapBox from "../map/MapBox"


import { AddressAutofill } from '@mapbox/search-js-react';


// import { AddressAutofill, AddressMinimap, useConfirmAddress, config } from '@mapbox/search-js-react';
// import { MapboxAutofill, MapboxSearch, SessionToken} from '@mapbox/search-js-core';
// import MapboxAutocomplete from 'react-mapbox-autocomplete';
// import Geocoder from 'react-mapbox-gl-geocoder';
// import Geocoder from 'react-map-gl-geocoder';


let nhoodCoords;

const Questionnaire = () => {

    const [displayKeyWord, setDisplayKeyWord] = useState(["email"]);
    const [neighborhood, setNeighborhood] = useState('');
    const [displayMap, setDisplayMap] = useState(false);
    const [selectedNhood, setSelectedNhood] = useState('');
    const [triggerZoom, setTriggerZoom] = useState (false);
    const [favPlace, setFavPlace] = useState('');

    const[placeTooFar, setPlaceTooFar] = useState(false);





    // function to calculate distance between two coordinates 
    function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2-lat1);  // deg2rad below
        var dLon = deg2rad(lon2-lon1); 
        var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; // Distance in km
        return d;
    }
    
    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }
    //-------------------------------------------------------




    // This function is going to be passed to the MapBox component, and from it we will get the coordinates of the neighbrhood that was selected by the user.
    const getNhoodCoords = (coords)=>{
        nhoodCoords = coords;
    }
    //-------------------------------------------------------


    // This function is going to be called when the user selects one of his favorite places, suggested by the MapBox API

    const selectedFavPlace = (place)=>{

        const coordsOfFavoritePlace = place.features[0].geometry.coordinates;

        const distance = getDistanceFromLatLonInKm(nhoodCoords[1],nhoodCoords[0], coordsOfFavoritePlace[1],
        coordsOfFavoritePlace[0])


        setTimeout(() => {
            if (distance > 2 ){
                setPlaceTooFar(true);
            } 
        }, 100);

      
    }

    const displayPlaceTooFar = placeTooFar === true ? 'placeTooFar' : 'placeNotTooFar';


    //-------------------------------------------------------









    function addEventToNeighborhoods(){

        const onNeighborhoodClick = (e)=>{
            setSelectedNhood(e.target.children[1].value);// here we are updating the selectedNhood state 
            e.target.removeEventListener("click", onNeighborhoodClick)
        }

        const onNeighborhoodEnter = (e) =>{// WE ARE NOT ENTERING THIS EVEN LISTENER 

                if (e.key === 'Enter') {
                    setSelectedNhood(e.target.children[1].value) // here we are updating the selectedNhood state 
                }
                e.target.removeEventListener("click", onNeighborhoodClick)
        }

        const nhoodOptions = document.getElementsByClassName('options-neighborhoods');
        for (var i =0 ; i < nhoodOptions.length ; i ++){

                nhoodOptions[i].addEventListener('click', onNeighborhoodClick,{            
                    capture: true,
                });
                
                nhoodOptions[i].addEventListener('keypress', onNeighborhoodEnter, {
                    capture: true,
                } );
        }

    }



    // Event listeners to previous and next arrows
    const prevQuestion = () => {
        const displayedQuestion = document.getElementsByClassName("display")[0];
        const keyWord = displayedQuestion.className.split(" ")[0];
        setDisplayKeyWord([keyWord]);
        if(displayedQuestion.className.indexOf('neighborhoodInput')>-1){
            setDisplayMap(false);
        }
    };

  

    const nextQuestion = () => {

        setTriggerZoom(false);

        const displayedQuestion = document.getElementsByClassName("display")[0];

        const label = displayedQuestion.children[1];
        const inputElement = displayedQuestion.children[0];

        if(displayedQuestion.className.indexOf('recommendationsScale')>-1){
            
            const selectedIndecesArray =[];
            const selectElements = displayedQuestion.querySelectorAll('select');
            selectElements.forEach(e => selectedIndecesArray.push(e.selectedOptions[0].className));

            const emptyElements = [];//this array will contain the index of the option that has no value.

            for (var i = 0 ; i < selectedIndecesArray.length; i ++ ){
            
                if(selectedIndecesArray[i]===""){
                    emptyElements.push (i)
                }
            }
          
            if(emptyElements.length>0){// if there is at least one select element with no value.
                for (var e = 0 ; e < emptyElements.length ; e ++){
                    shakeSelectElement(selectElements[emptyElements[e]])
                }
                return;
            }

            setDisplayKeyWord(selectedIndecesArray);

        } else if(displayedQuestion.className.indexOf('recomendationsExplanation')>-1){

            const displayedQuestions = document.getElementsByClassName("display");

            const emptyTextAreasIndeces = [];

            for (var i = 0 ; i < displayedQuestions.length; i ++){
                
                const textAreaValue = displayedQuestions[i].children[1].value;

                if (textAreaValue===""){
                    emptyTextAreasIndeces.push(i)
                    // return 
                }
            }


            if (emptyTextAreasIndeces.length > 0 ){

                for(var i =0; i < emptyTextAreasIndeces.length ; i ++ ){

                    // console.log(displayedQuestions[emptyTextAreasIndeces[i]]);

                    const label = displayedQuestions[emptyTextAreasIndeces[i]].children[0];
                    const textArea =  displayedQuestions[emptyTextAreasIndeces[i]].children[1];

                    shakeElements(textArea, label)

                }

                return
            }

            setDisplayKeyWord(['favoritePlaces']);

        }else if(displayedQuestion.className.indexOf('lengthLivingInHood')>-1 || 
            displayedQuestion.className.indexOf('nhoodDescript')>-1){

            const keyWord = displayedQuestion.className.split(" ")[1];

            const header = displayedQuestion.children[0];
            const selectElement = displayedQuestion.children[1];
            const selectElementValue = selectElement.value;

    
            if(selectElementValue === ''){
                shakeElements(selectElement,header );
                return;
            }

            setDisplayKeyWord([keyWord]);
      
        }else{
            const keyWord = displayedQuestion.className.split(" ")[1];
           
            if(displayedQuestion.className.indexOf('neighborhoodInput')>-1){

                const inputElementValue = inputElement.value;

                if(inputElementValue === ''){
                    
                    shakeElements(inputElement,label );
                    return;
                }

                setDisplayKeyWord([keyWord]);
                setNeighborhood(displayedQuestion.children[0].value);

            }
            if(displayedQuestion.className.indexOf('emailInput')>-1){

                const inputElementValue = inputElement.value.toLowerCase();

                const match = inputElementValue.match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)

                if(!match){                  
                    shakeElements(inputElement, label);
                    return;
                }

                setDisplayKeyWord([keyWord]);
                setTriggerZoom(true);
                setDisplayMap(true);

            }
        }
    };



    const displayQuestion = keyWord => {
        if (displayKeyWord.indexOf(keyWord)>-1) {
        return "display";
        } else {
        return "notDisplay";
        }
    };


    return (

    <div className ="map-questionnaire-container">
        <form className="form">
            <div  className={"__ whatNeighborhood emailInput " + displayQuestion("email")}>      
                <input type="text" id="email"  placeholder=" "></input>
                <label className= "floating-label" id="email-label" htmlFor="email">What is your email?</label>
            </div>

            <div className={"email yearsInNeighborhood neighborhoodInput " + displayQuestion("whatNeighborhood")}>
                <input id="neighborhood" onChange={(e)=>{

                            setSelectedNhood(selectNeighborhood (e));  
                            addEventToNeighborhoods();

                        }
                    } 

                    placeholder=" ">
                    
                </input>
                <label className= "floating-label" htmlFor="neighborhood">What neighborhood do you live in?</label>
            </div>

            <div className={"whatNeighborhood describeNeighborhood lengthLivingInHood " + displayQuestion("yearsInNeighborhood")}>
                <h3 >How long have you been living in <span className='nhoodName'>{neighborhood}</span></h3>
                <select name="yearsInNeighborhood" id="yearsInNeighborhood">
                    <option value="">Choose an option</option>
                    <option value="Less than one year">Less than one year</option>
                    <option value="Between 1 and 5 years">Between 1 and 5 years</option>
                    <option value="Between 6 and 10 years">Between 6 and 10 years</option>
                    <option value="Between 11 and 15 years">Between 11 and 15 years</option>
                    <option value="Between 16 and 20 years">Between 16 and 20 years </option>
                    <option value="For more than 20 years">For more than 20 years </option>
                    <option value="I do not live in this neighborhood">I do not live in this neighborhood </option>
                </select>
            </div>

            <div className={"yearsInNeighborhood recommendations nhoodDescript " + displayQuestion("describeNeighborhood")}>
                <h3 className="description-header">How would you describe <span className='nhoodName'>{neighborhood}</span> to someone who is visiting for the first time? </h3> 
                <textarea id='nhoodDescription'></textarea> 
            </div>




            <div className ={"describeNeighborhood __  " + displayQuestion("recommendations") + " recommendationsScale"} >

                <h3>What are your recommendations for people visiting <span className='nhoodName'>{neighborhood}</span>:</h3>

                <span className ="recomendations-span">
                    <label className="label-recommendations" htmlFor="yearsInNeighborhood">Using public transportation: </label>
                    <select >
                        <option value="">Select an option</option>
                        <option className="whyRecommendPublicTransport" value="Recommended">Recommended</option>
                        <option className="whyNeutralPublicTransport" value="Neutral">Neutral</option>
                        <option className="whyNotRecommendPublicTransport" value="Not recommended">Not recommended</option>
                    </select>
                </span>

                <span className ="recomendations-span">
                    <label className="label-recommendations" htmlFor="yearsInNeighborhood">Walking around: </label>
                    <select >
                        <option value="">Select an option</option>
                        <option className="whyRecommendWalkingAround" value="Recommended">Recommended</option>
                        <option className="whyNeutralWalkingAround" value="Neutral">Neutral</option>
                        <option className="whyNotRecommendWalkingAround" value="Not recommended">Not recommended</option>
                    </select>
                </span>


                <span className ="recomendations-span">
                    <label className="label-recommendations" htmlFor="yearsInNeighborhood">Biking: </label>
                    <select >
                        <option value="">Select an option</option>
                        <option className="whyRecommendBiking" value="Recommended">Recommended</option>
                        <option className="whyNeutralBiking" value="Neutral">Neutral</option>
                        <option className="whyNotRecommendBiking" value="Not recommended">Not recommended</option>
                    </select>
                </span>

                <span className ="recomendations-span">
                    <label className="label-recommendations" htmlFor="yearsInNeighborhood">Trying out the food: </label>
                    <select >
                        <option value="">Select an option</option>
                        <option className="whyRecommendFood" value="Recommended">Recommended</option>
                        <option className="whyNeutralFood" value="Neutral">Neutral</option>
                        <option className="whyNotRecommendFood" value="Not recommended">Not recommended</option>
                    </select>
                </span> 


                <span className ="recomendations-span">
                    <label className="label-recommendations" htmlFor="yearsInNeighborhood">Nighlife: </label>
                    <select >
                        <option value="">Select an option</option>
                        <option className="whyRecommendNightlife" value="Recommended">Recommended</option>
                        <option className="whyNeutralNightlife" value="Neutral">Neutral</option>
                        <option className="whyNotRecommendNightlife"value="Not recommended">Not recommended</option>
                    </select>
                </span>                        

            </div>



        
            <div className={"recommendations favoritePlaces recomendationsExplanation " + displayQuestion("whyRecommendPublicTransport") }>
                <label >Why do you recommend using public transportation in <span className='nhoodName'>{neighborhood}</span>?</label>
                <textarea className="textAreaFactorDescription"></textarea>
            </div>

            <div className={"recommendations recomendationsExplanation " + displayQuestion("whyNeutralPublicTransport")}>
                <label>Why do you feel neutral about public transportation in <span className='nhoodName'>{neighborhood}</span>?</label>
                <textarea className="textAreaFactorDescription"></textarea>
            </div>

            <div className={"recommendations recomendationsExplanation " + displayQuestion("whyNotRecommendPublicTransport")}>
                <label>Why do you not recommend using public transportation in <span className='nhoodName'>{neighborhood}</span>?</label>
                <textarea className="textAreaFactorDescription"></textarea>
            </div>      



                

                
                
            <div className={"recommendations recomendationsExplanation " + displayQuestion("whyRecommendWalkingAround")}>
                <label >Why do you recommend walking around <span className='nhoodName'>{neighborhood}</span>?</label>
                <textarea className="textAreaFactorDescription"></textarea>
            </div>

            <div className={"recommendations recomendationsExplanation " + displayQuestion("whyNeutralWalkingAround")}>
                <label>Why do you feel neutral about walking around <span className='nhoodName'>{neighborhood}</span>?</label>
                <textarea className="textAreaFactorDescription"></textarea>
            </div>

            <div className={"recommendations recomendationsExplanation " + displayQuestion("whyNotRecommendWalkingAround")}>
                <label>Why do you not recommend walking around <span className='nhoodName'>{neighborhood}</span>?</label>
                <textarea className="textAreaFactorDescription" ></textarea>
            </div>      







            <div className={"recommendations " + displayQuestion("whyRecommendBiking")}>
                <label >Why do you recommend biking around <span className='nhoodName'>{neighborhood}</span>?</label>
                <textarea className="textAreaFactorDescription"></textarea>
            </div>

            <div className={"recommendations " + displayQuestion("whyNeutralBiking")}>
                <label>Why do you feel neutral about biking around <span className='nhoodName'>{neighborhood}</span>?</label>
                <textarea className="textAreaFactorDescription"></textarea>
            </div>

            <div className={"recommendations " + displayQuestion("whyNotRecommendBiking")}>
                <label>Why do you not recommend biking around <span className='nhoodName'>{neighborhood}</span>?</label>
                <textarea className="textAreaFactorDescription"></textarea>
            </div>     

                
                
                

            <div className={"recommendations " + displayQuestion("whyRecommendFood")}>
                <label >Why do you recommend trying out the food of <span className='nhoodName'>{neighborhood}</span>?</label>
                <textarea className="textAreaFactorDescription"></textarea>
            </div>

            <div className={"recommendations " + displayQuestion("whyNeutralFood")}>
                <label>Why do you feel neutral about trying out the food of <span className='nhoodName'>{neighborhood}</span>?</label>
                <textarea className="textAreaFactorDescription"></textarea>
            </div>

            <div className={"recommendations " + displayQuestion("whyNotRecommendFood")}>
                <label>Why do you not recommend trying out the food of <span className='nhoodName'>{neighborhood}</span>?</label>
                <textarea className="textAreaFactorDescription"></textarea>
            </div>     



            
            

            <div className={"recommendations " + displayQuestion("whyRecommendNightlife")}>
                <label >Why do you recommend <span className='nhoodName'>{neighborhood}'s</span> nigh life?</label>
                <textarea className="textAreaFactorDescription" ></textarea>
            </div>

            <div className={"recommendations " + displayQuestion("whyNeutralNightlife")}>
                <label>Why do you feel neutral about <span className='nhoodName'>{neighborhood}'s</span> night life?</label>
                <textarea className="textAreaFactorDescription"></textarea>
            </div>


            <div className={"recommendations " + displayQuestion("whyNotRecommendNightlife")}>
                <label>Why do you not recommend <span className='nhoodName'>{neighborhood}'s</span> night life?</label>
                <textarea className="textAreaFactorDescription"></textarea>
            </div>   



            <div className={"recommendations submit " + displayQuestion("favoritePlaces")}>
                <h2 className="fav-places-element">What are your favorite places in <span className='nhoodName'>{neighborhood}</span> ? </h2>

                {/* <label className="fav-places-label" >Address or Name of the place:</label> */}

                <AddressAutofill accessToken="=======" 
                options={{
                    language: 'en',
                    country: 'US',
                     bbox: [-74.25909, 40.477399, -73.700181, 40.916178]

                }}
                 onRetrieve = {(e)=>{selectedFavPlace(e)}}
                >

                    <div className ='favPlaceContainer'>
                        <input 
                            autoComplete="street-address"
                            name="address"
                            placeholder="Address of favorite place..."
                            type="text"
                            className ="inputFavPlace"

                            value={favPlace}
                            onChange ={ (e) => {
                                    setFavPlace(e.target.value )
                                    setPlaceTooFar(false);
                                } 
                            }>
                          
                        </input>

                        <div className ={"placeIsFarLabel " + displayPlaceTooFar}>This place seems to bee too far from <b>{neighborhood}</b>. Please choose a place that is in or near <b>{neighborhood}</b>. </div>
                    </div>

                </AddressAutofill>

           



                <label className="fav-places-label" htmlFor ='nhoodDescription'>Why is this one of your favorite places in <span className='nhoodName'>{neighborhood}</span> </label>
                <textarea className="fav-places-answer" id='nhoodDescription'></textarea>
                <label className="fav-places-label" htmlFor ='placeImage'>Upload a picture of this place: </label>
                <input className="fav-places-answer" type="file" name="placeImage" id ="placeImage" />    

            </div>   


            <div className={"favoritePlaces " + displayQuestion("submit")}>
                <label>Submit form: </label>
                <input type='submit'></input>
            </div>   

    

            <div className ="arrows-container">

                <i
                    onClick={() => {
                    prevQuestion();
                    }}
                    id="prev"
                    className="fa-solid fa-caret-left"
                ></i>

                <i
                    onClick={() => {
                    nextQuestion();
                    }}
                    id="next"
                    className="fa-solid fa-caret-right"
                ></i>

            </div>

        </form>





        <MapBox displayMap={displayMap} selectedNhood ={selectedNhood} triggerZoom={triggerZoom} onSelectedNhoodCoords = { getNhoodCoords} />

    </div>
    

    

  )


};


export default Questionnaire;



/*
<MapboxAutocomplete
                    publicKey= "===="

                    inputClass="form-control search"

                    onSuggestionSelect={_suggestionSelect}
                    
                    country="us"

                    proximity = {[40.7128, 74.0060]}
                    
                    resetSearch={false}
                    placeholder="Search Address..."
/>
*/


// next is goin to get the element with 'display' in its class name.
// It then is going to retreie the second word in the class name of that element, and will provide it as value of displayKeyWord.
// the the compoenent will rerender and displayQuestion() will compare displayKeyWord to its value, if they match, the will be displayed.