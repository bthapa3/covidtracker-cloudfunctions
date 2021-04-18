// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
const { ref } = require('firebase-functions/lib/providers/database');
const { user } = require('firebase-functions/lib/providers/auth');
admin.initializeApp(functions.config().firebase);
var db = admin.database();
var usersref = db.ref("/Users/");


 // listens to new updates for changes in covid status and updates as needed.
exports.checkTransmission = functions.database
    .ref('/Users/{userid}/')
    .onUpdate(async(change, context) => {
     //Setting an 'uppercase' field in Firestore document returns a Promise.
     
        const after=  await change.after.val();
        const before= await change.before.val();
        //await is needed in order to receive snapshot properly before comparing
        //If async function is not used could cause race conditions as data
      

        if(after.infected===true && before.infected===false){

            var snapshot = await usersref.once('value');
            //var snapshot2 = await locationref.once('value');
            const doc=await admin.firestore().collection("userlocation").doc(after.userID).get();
        
            const locarray= await doc.data().locations;      
        
            //await because  of race conditions might destroy everything.
    
            locarray.forEach(point=>{
                snapshot.forEach((child)=>{
                    //const childlocarray = 
                    //console.log("respinse" );
                    if(after.userID!==child.val().userID){
                        var check= checkcordinates(child,point);
                        check.then(function(result) {
    
                            ///check if the funnction ran  or not
                            //console.log("Sdfsdf"+  loca);
                            ///console.log(result);
                            // here you can use the result of promiseB
                        });    

                    }
    
                                
                });    
            });
            

            snapshot.forEach((child) => {
                
                    
                    
                    if(after.userID!==child.val().userID) {
                        if(  (after.group1==child.val().group1) || (after.group1==child.val().group2) 
                        || (after.group1==child.val().group3) || (after.group1==child.val().group4) || (after.group2==child.val().group1) 
                        || (after.group2==child.val().group2) || (after.group2==child.val().group3) || (after.group2==child.val().group4) 
                        || (after.group3==child.val().group1) || (after.group3==child.val().group2) || (after.group3==child.val().group3)
                        || (after.group3==child.val().group4) || (after.group4==child.val().group1) || (after.group4==child.val().group2)
                        || (after.group4==child.val().group3) ||(after.group4==child.val().group4) )
                         
                        {
                            //updating the transfer risk to true if the group of any child are common with the groups of positive person.
                            child.ref.update({transferrisk:true});
                        }  
                    };
                                              
            });
            




        }
         
        return null;

     
    });       

    
    async function checkcordinates(child,point) {
        await admin.firestore().collection("userlocation").doc(child.val().userID).get()
        .then(doc => {
           /// console.log(doc.data().locations);
            var locations= doc.data().locations;
            locations.forEach(childpoint=>{
               
                if(child._latitude===childpoint._latitude  && child._longitude===childpoint._longitude){
                    console.log("child"  +childpoint._latitude+" "+ childpoint._longitude);
                    console.log("main"  +point._latitude+" "+ point._longitude);
                    child.ref.update({transferrisk:true});  
                }
            })

        });
         
    }