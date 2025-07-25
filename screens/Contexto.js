import React, { useState } from 'react'

export const MovieContext = React.createContext();

export const MovieProvider = (props) => {
  const [movies, setMovies] = useState([])
  const [trata, setTrata] = useState([])
  const [torosx, setTorosx] = useState([])
  const[motivosx, setMotivos] = useState([])

// MOVIES = animales

  return (
    <MovieContext.Provider value={{
      movies, setMovies,
      trata, setTrata,
      torosx, setTorosx,
      motivosx, setMotivos
    }}>
      {props.children}
    </MovieContext.Provider>
  )

}