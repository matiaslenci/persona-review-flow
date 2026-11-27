export type Match = {
  id: number;
  marca: string;
  nodo: string;
  fecha: string;
  aforo: string;
  bis: string;
  nombre: string;
  tipo: string;
  numero: string;
  cuit: string;
  apeMaterno: string;
  estado: string;
  vigencia: string;
  lse: string;
};

export type Persona = {
  id: string;
  apellido: string;
  nombre: string;
  tipo: string;
  dni: string;
  cuil: string;
  nacionalidad: string;
  domicilio: string;
  busqueda: string;
};

export const informe = {
  formulario: "184522",
  aforo: "2026/0912",
  estadoPago: "NO PAGADO",
  ultimoMovimiento: "29-09-2026",
  fechaAforado: "29-09-2026",
  escribano: "Perez, Gustavo Andres",
  matricula: "805",
  registro: "787",
  direccion: "San Martin 1235 (Reconquista)",
  telefono: "0342-4506600",
  naturaleza: "Adjudicación",
  cierreSantaFe: "08/04/2026",
  cierreRosario: "07/04/2026",
};

export const personas: Persona[] = [
  { id: "p1", apellido: "Paniccia", nombre: "Luciano", tipo: "Persona Humana", dni: "44777458", cuil: "20447774586", nacionalidad: "Argentino", domicilio: "Tucumán 2942", busqueda: "gonzalez perez juana" },
  { id: "p2", apellido: "Ramírez", nombre: "María Belén", tipo: "Persona Humana", dni: "31254880", cuil: "27312548804", nacionalidad: "Argentina", domicilio: "Bv. Gálvez 1450", busqueda: "ramirez maria" },
  { id: "p3", apellido: "Sosa", nombre: "Esteban Julián", tipo: "Persona Humana", dni: "28990112", cuil: "20289901127", nacionalidad: "Argentino", domicilio: "Rivadavia 3301", busqueda: "sosa esteban" },
];

const m = (id: number, marca: string, fecha: string, aforo: string, nombre: string, estado: string, vigencia: string, cuit = "00000000000"): Match => ({
  id, marca, nodo: "S", fecha, aforo, bis: "", nombre, tipo: "", numero: "", cuit, apeMaterno: "", estado, vigencia, lse: "",
});

/** Simulated registry lookup results per person. */
export const resultados: Record<string, Match[]> = {
  p1: [
    m(1, "", "13/02/2014", "013781", "GONZALEZ PEREZ JUANA", "CADUCA C", "13/02/2024"),
    m(2, "", "26/12/2018", "212129", "GONZALEZ PEREZ JUANA", "PROVISIONAL", "00/00/0000"),
    m(3, "V", "13/02/2014", "013781", "SUCESION DE GONZALEZ PEREZ JUANA", "CADUCA C", "13/02/2024"),
    m(4, "V", "26/12/2018", "212129", "SUCESION DE GONZALEZ PEREZ JUANA", "PROVISIONAL", "00/00/0000"),
  ],
  p2: [
    m(5, "", "04/07/2021", "098812", "RAMIREZ MARIA BELEN", "DEFINITIVA", "04/07/2026", "27312548804"),
    m(6, "", "19/11/2016", "045530", "RAMIREZ MARIA ISABEL", "CADUCA C", "19/11/2021"),
  ],
  p3: [],
};
