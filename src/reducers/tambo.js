const intialState = { id: '0', nombre: 'Sin Tambo', host: '' }

const SELECCIONAR = 'SELECCIONAR'

export const selectTambo = tambo => ({
   type: SELECCIONAR,
   payload: {
      id:tambo.id,
      nombre: tambo.nombre,
      host:tambo.host,
      bajadas: tambo.bajadas,
      ...tambo
   }
})

//Actualiza el estado de la aplicacion
export default (state = intialState, action) => {
   switch (action.type){
   case SELECCIONAR:
      return action.payload
   default:
      return state
   }
}
