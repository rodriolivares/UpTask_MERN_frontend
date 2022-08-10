import { useContext } from "react";
import ProyectosContext from "../context/ProyectosProvider";
import ProyectosProvider from "../context/ProyectosProvider";

const useProyectos = () => {
   return useContext(ProyectosContext)
}

export default useProyectos