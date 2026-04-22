import React, { useState } from "react";

function App() {
  const [prendas, setPrendas] = useState([]);
  const [nombre, setNombre] = useState("");
  const [imagen, setImagen] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const agregarPrenda = () => {
    if (!nombre || !imagen) return;

    const nuevaPrenda = {
      nombre,
      imagen: URL.createObjectURL(imagen)
    };

    setPrendas([...prendas, nuevaPrenda]);
    setNombre("");
    setImagen(null);
  };

  const toggleModo = () => {
    setDarkMode(!darkMode);
  };

  const colores = {
    fondo: darkMode ? "#121212" : "#f5f5f5",
    tarjeta: darkMode ? "#1e1e1e" : "#ffffff",
    texto: darkMode ? "#ffffff" : "#000000",
    boton: "#facc15"
  };

  return (
    <div style={{
      backgroundColor: colores.fondo,
      minHeight: "100vh",
      padding: 20,
      color: colores.texto,
      fontFamily: "Arial"
    }}>

      <div style={{
        maxWidth: 500,
        margin: "auto",
        background: colores.tarjeta,
        padding: 20,
        borderRadius: 12,
        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)"
      }}>

        <h1 style={{ textAlign: "center" }}>Mi Closet Smart 👕</h1>

        <button 
          onClick={toggleModo}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 15,
            borderRadius: 8,
            border: "none",
            background: colores.boton,
            color: "#1f2937",
            cursor: "pointer"
          }}
        >
          Modo {darkMode ? "Claro ☀️" : "Oscuro 🌙"}
        </button>

        <input
          type="text"
          placeholder="Nombre de la prenda"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
            marginBottom: 10
          }}
        />

        <input
          type="file"
          onChange={(e) => setImagen(e.target.files[0])}
          style={{ marginBottom: 10 }}
        />

        <button 
          onClick={agregarPrenda}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "none",
            background: "#facc15",
            color: "#1f2937",
            cursor: "pointer"
          }}
        >
          Agregar prenda
        </button>

      </div>

      <div style={{
        marginTop: 20,
        display: "flex",
        flexWrap: "wrap",
        gap: 15,
        justifyContent: "center"
      }}>
        {prendas.map((p, i) => (
          <div key={i} style={{
            background: colores.tarjeta,
            padding: 10,
            borderRadius: 10,
            width: 120,
            textAlign: "center",
            boxShadow: "0px 2px 6px rgba(0,0,0,0.1)"
          }}>
            <img src={p.imagen} alt="" width="100%" />
            <p style={{ fontSize: 14 }}>{p.nombre}</p>
          </div>
        ))}
      </div>

    </div>
  );
}

export default App;