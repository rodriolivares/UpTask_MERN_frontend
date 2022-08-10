import { useState, useEffect, createContext } from "react";
import { useNavigate } from "react-router-dom";
import clienteAxios from "../config/clienteAxios";
import io from 'socket.io-client'

let socket

const ProyectosContext = createContext()

const ProyectosProvider = ({ children }) => {
   const [proyectos, setProyectos] = useState({});
   const [alerta, setAlerta] = useState({});
   const [proyecto, setProyecto] = useState({});
   const [cargando, setCargando] = useState(false);
   const [iniciaSesion, setIniciaSesion] = useState(false);
   const [modalFormularioTarea, setModalFormularioTarea] = useState(false);
   const [tarea, setTarea] = useState({});
   const [modalEliminarTarea, setModalEliminarTarea] = useState(false);
   const [colaborador, setColaborador] = useState({});
   const [modalElminarColaborador, setModalElminarColaborador] = useState(false);
   const [buscador, setBuscador] = useState(false);
   
   const navigate = useNavigate()

   useEffect(() => {
      const obtenerProyectos = async () => {
         try {
            const token = localStorage.getItem('token')
            if(!token) return
            const config = {
               headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
               }
            }
   
            const { data } = await clienteAxios.get('/proyectos', config)
            setProyectos(data);
         } catch (error) {
            console.log(error);
         }
      }
      if(!iniciaSesion) obtenerProyectos()
   }, [iniciaSesion]);

   useEffect(() => {
      socket = io(import.meta.env.VITE_BACKEND_URL)
   }, []);

   const mostrarAlerta = alerta => {
      setAlerta(alerta)

      setTimeout(() => {
         setAlerta({})
      }, 5000);
   }

   const submitProyecto = async proyecto => {
      if(proyecto.id) {
         await editarProyecto(proyecto)
      } else {
         await nuevoProyecto(proyecto)
      }
   }

   const editarProyecto = async proyecto => {
      try {
         const token = localStorage.getItem('token')
         if(!token) return
         const config = {
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`
            }
         }

         const { data } = await clienteAxios.put(`/proyectos/${proyecto.id}`, proyecto, config)

         const proyectosActualizados = proyectos.map(proyectoState => proyectoState._id === data._id ? data : proyectoState)
         setProyectos(proyectosActualizados)

         setAlerta({
            msg: 'Proyecto Actualizado Correctamente',
            error: false
         })

         setTimeout(() => {
            setAlerta({})
            navigate('/proyectos')
         }, 3000);
         
      } catch (error) {
         setAlerta({
            msg: 'Hubo un error, Intente mas tarde',
            error: false
         })
      }
   }

   const nuevoProyecto = async proyecto => {
      try {
         const token = localStorage.getItem('token')
         if(!token) return
         const config = {
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`
            }
         }

         const { data } = await clienteAxios.post('/proyectos', proyecto, config)

         setProyectos([...proyectos, data])
         setAlerta({
            msg: 'Proyecto Creado Correctamente',
            error: false
         })

         setTimeout(() => {
            setAlerta({})
            navigate('/proyectos')
         }, 3000);
         
      } catch (error) {
         setAlerta({
            msg: '',
            error: true
         })
      }
   }

   const obtenerProyecto = async id => {
      setCargando(true)
      try {
         const token = localStorage.getItem('token')
         if(!token) return
         const config = {
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`
            }
         }

         const { data } = await clienteAxios.get(`/proyectos/${id}`, config)
         // console.log(data);
         setProyecto(data);
         setAlerta({})
      } catch (error) {
         navigate('/proyectos')
         setAlerta({
            msg: error.response.data.msg,
            error: true
         })
         setTimeout(() => {
            setAlerta({})
         }, 3000);
      }
      setCargando(false)

   }

   const eliminarProyecto = async id => {
      try {
         const token = localStorage.getItem('token')
         if(!token) return
         const config = {
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`
            }
         }
         const { data } = await clienteAxios.delete(`/proyectos/${id}`, config)

         const proyectosActualizados = proyectos.filter(proyectoState => proyectoState._id !== id)
         setProyectos(proyectosActualizados)

         setAlerta({
            msg: data.msg,
            error: false
         })

         setTimeout(() => {
            setAlerta({})
            navigate('/proyectos')
         }, 3000);

      } catch (error) {
         console.log(error);
      }
   }

   const handleModalTarea = () => {
      setModalFormularioTarea(!modalFormularioTarea)
      setTarea({})
   }

   const submitTarea = async tarea => {
      if(tarea?.id) {
         editarTarea(tarea)
      } else {
         await crearTarea(tarea)
      }
   }

   const crearTarea = async tarea => {
      try {
         const token = localStorage.getItem('token')
         if(!token) return
         const config = {
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`
            }
         }

         const { data } = await clienteAxios.post('/tareas', tarea, config)

         setAlerta({})
         setModalFormularioTarea(false)

         socket.emit('nueva tarea', data)
      } catch (error) {
         console.log(error);
      }
   }

   const editarTarea = async tarea => {
      try {
         const token = localStorage.getItem('token')
         if(!token) return
         const config = {
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`
            }
         }

         const { data } = await clienteAxios.put(`/tareas/${tarea.id}`, tarea, config)



         setAlerta({})
         setModalFormularioTarea(false)

         socket.emit('actualizar tarea', data)
      } catch (error) {
         console.log(error);
      }  
   }

   const handleModalEditarTarea = tarea => {
      setTarea(tarea);
      setModalFormularioTarea(true)
   }

   const handleModalEliminarTarea = tarea => {
      setTarea(tarea)
      setModalEliminarTarea(!modalEliminarTarea) 
   }

   const eliminarTarea = async () => {
      try {
         const token = localStorage.getItem('token')
         if(!token) return
         const config = {
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`
            }
         }

         const { data } = await clienteAxios.delete(`/tareas/${tarea._id}`, config)

         const proyectoActualizado = { ...proyecto }
         proyectoActualizado.tareas = proyectoActualizado.tareas.filter( tareaState => tareaState._id !== tarea._id )
         setProyecto(proyectoActualizado)

         setAlerta({
            msg: data.msg,
            alerta: false
         })
         setModalEliminarTarea(false)
         socket.emit('eliminar tarea', tarea)
         
         setTarea({})
         setTimeout(() => {
            setAlerta({})
         }, 3000);
      } catch (error) {
         console.log(error);
      }
   }

   const submitColaborador = async email => {
      setCargando(true)
      try {
         const token = localStorage.getItem('token')
         if(!token) return
         const config = {
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`
            }
         }
         const { data } = await clienteAxios.post('/proyectos/colaboradores', { email }, config)

         setColaborador(data);
         setAlerta({})
      } catch (error) {
         setAlerta({
            msg: error.response.data.msg,
            error: true
         })
      } finally {
         setCargando(false)
      }
   }

   const agregarColaborador = async email => {
      try {
         const token = localStorage.getItem('token')
         if(!token) return
         const config = {
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`
            }
         }
         const { data } = await clienteAxios.post(`/proyectos/colaboradores/${proyecto._id}`, email, config)

         console.log(data);

         setAlerta({
            msg: data.msg,
            error: false
         })
         setColaborador({});
         setTimeout(() => {
            setAlerta({})
         }, 3000);
      } catch (error) {
         console.log(error);
         setAlerta({
            msg: error.response.data.msg,
            error: true
         })
      }
   }

   const handleModalEliminarColaborador = colaborador => {
      setModalElminarColaborador(!modalElminarColaborador)

      setColaborador(colaborador);
   }

   const eliminarColaborador = async () => {
      try {
         const token = localStorage.getItem('token')
         if(!token) return
         const config = {
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`
            }
         }
         const { data } = await clienteAxios.post(`/proyectos/eliminar-colaborador/${proyecto._id}`, { id: colaborador._id }, config)

         console.log(data);

         const proyectoActualizado = {...proyecto}

         proyectoActualizado.colaboradores = proyectoActualizado.colaboradores.filter( colaboradorState => colaboradorState._id !== colaborador.id )

         setProyecto(proyectoActualizado)

         setAlerta({
            msg: data.msg,
            error: false
         })

         setColaborador({});
         setTimeout(() => {
            setAlerta({})
         }, 3000);
         setModalElminarColaborador(false)
      } catch (error) {
         console.log(error.response);
         setAlerta({
            msg: error.response.data.msg,
            error: true
         })
      }
   }

   const completarTarea = async id => {
      try {
         const token = localStorage.getItem('token')
         if(!token) return
         const config = {
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`
            }
         }

         const { data } = await clienteAxios.post(`/tareas/estado/${id}`, {}, config)

         setTarea({})
         setAlerta({})

         socket.emit('cambiar estado', data)
      } catch (error) {
         console.log(error);
      }
   }

   const handleBuscador = () => {
      setBuscador(!buscador)
   }

   const submitTareasProyecto = (tarea) => {
      const proyectoActualizado = { ...proyecto }
      console.log(proyectoActualizado.tareas);
      proyectoActualizado.tareas = [ ...proyectoActualizado.tareas, tarea ]
      setProyecto(proyectoActualizado)
   }

   const eliminarTareaProyecto = tarea => {
      const proyectoActualizado = { ...proyecto }
      proyectoActualizado.tareas = proyectoActualizado.tareas.filter( tareaState => tareaState._id !== tarea._id )
      setProyecto(proyectoActualizado)
   }

   const actualizarTareaProyecto = tarea => {
      const proyectoActualizado = { ...proyecto }
      proyectoActualizado.tareas = proyectoActualizado.tareas.map( tareaState => tareaState._id === tarea._id ? tarea : tareaState )
      setProyecto(proyectoActualizado)
   }

   const cambiarEstadoTarea = tarea => {
      const proyectoActualizado = {...proyecto}
      proyectoActualizado.tareas = proyectoActualizado.tareas.map( tareaState => tareaState._id === tarea._id ? tarea : tareaState)
      setProyecto(proyectoActualizado)
   }

   const cerrarSesionProyectos = () => {
      setProyectos({})
      setProyecto({})
      setAlerta({})
   }
   return (
      <ProyectosContext.Provider
         value={{
            proyectos,
            mostrarAlerta,
            alerta,
            submitProyecto,
            obtenerProyecto,
            proyecto,
            cargando,
            eliminarProyecto,
            setIniciaSesion,
            modalFormularioTarea,
            handleModalTarea,
            submitTarea,
            handleModalEditarTarea,
            tarea,
            modalEliminarTarea,
            handleModalEliminarTarea,
            eliminarTarea,
            submitColaborador,
            colaborador,
            agregarColaborador,
            modalElminarColaborador,
            handleModalEliminarColaborador,
            eliminarColaborador,
            completarTarea,
            buscador,
            handleBuscador,
            submitTareasProyecto,
            eliminarTareaProyecto,
            actualizarTareaProyecto,
            cambiarEstadoTarea,
            cerrarSesionProyectos
         }}
      >
         {children}
      </ProyectosContext.Provider>
   )
}

export { ProyectosProvider }
export default ProyectosContext