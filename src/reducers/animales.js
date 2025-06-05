import firebase from '../../database/firebase';
import { useState } from 'react';

const makeType = mod => type => `${mod}/${type}`

const mac = (type, ...argNames) => (...args) => {
   const action = { type }
   argNames.forEach((arg, index) => {
      action[argNames[index]] = args[index]
   })
   return action
}

const FETCH_START = 'fetch-start'
const FETCH_SUCCESS = 'fetch-success'
const FETCH_ERROR = 'fetch-error'

const initialState = {
   data: [],
   fetched: false,
   fetching: false,
}

export default (state = initialState, action) => {
   switch (action.type) {

      case FETCH_START: {
  
         return {
            ...state,
            fetching: true,
         }
      }
      case FETCH_SUCCESS: {
       
         return {
            ...state,
            fetching: false,
            fetched: true,
            data: action.payload,
         }
      }
      case FETCH_ERROR: {
    
         return {
            ...state,
            fetching: false,
            data: action.error,

         }
      }
      default:
         return state


   }
}

const startFetch = () => ({
   type: FETCH_START,
})

const successFetch = payload => ({
   type: FETCH_SUCCESS,
   payload,
})

const errorFetch = error => ({
   type: FETCH_ERROR,
   error,
})
/* 
export const fetch = (idtambo) =>

   async (dispatch) => {
      const [animales, guardarAnimales] = useState([]);
      dispatch(startFetch())
      try {

         async function snapshotAnimal(snapshot) {
            const an = snapshot.docs.map(doc => {
             
              return {
                id: doc.id,
                ...doc.data()
              }
              
            })
            guardarAnimales(an);
            
          }; 

        const response=await firebase.db.collection('animal').where('idtambo', '==', idtambo).where('fbaja', '==', '').orderBy('rp').get().then(snapshotAnimal);
        
        /*.then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
               console.log(doc);
               return {
                  id: doc.id,
                  ...doc.data()
                }
            });
            }).catch((error) => {
                  dispatch(errorFetch(error))
            });
         dispatch(successFetch(animales))
      } catch (e) {
         dispatch(errorFetch(e))
      }
   }
               */
