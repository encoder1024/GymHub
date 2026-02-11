import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import { supabase } from "../supabaseClient"; // Tu cliente de supabase

const GymAutocomplete = ({ onSelectGym }) => {
  const [inputValue, setInputValue] = useState("");

  // Esta función llama a Supabase
  const loadOptions = async (searchValue) => {
    if (!searchValue || searchValue.length < 2) return [];

    const { data, error } = await supabase.rpc("search_gyms_autocomplete", {
      search_term: searchValue,
    });

    if (error) {
      console.error("Error buscando gimnasios:", error);
      return [];
    }

    // Adaptamos los datos al formato que pide react-select: { value, label }
    return data.map((gym) => ({
      value: gym.id,
      label: gym.title,
    }));
  };

  const customStyles = {
    // El contenedor principal del input
    control: (base, state) => ({
      ...base,
      backgroundColor: "#1A1A1A", // Gris oscuro del home
      borderColor: state.isFocused ? "#ffffff" : "#333", // Borde blanco al hacer foco
      boxShadow: "none",
      "&:hover": { borderColor: "#ffffff" },
    }),
    // El menú desplegable
    menu: (base) => ({
      ...base,
      backgroundColor: "#1A1A1A",
      border: "1px solid #333",
    }),
    // Cada opción individual
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected
        ? "#ffffff" // Fondo si está seleccionado
        : isFocused
          ? "#333" // Fondo al pasar el mouse (hover)
          : "#1A1A1A", // Fondo normal
      color: isSelected
        ? "#000000" // Texto si está seleccionado
        : "#ffffff", // Texto normal y hover
      cursor: "pointer",
      "&:active": { backgroundColor: "#444" },
    }),
    // El texto que escribís y el placeholder
    input: (base) => ({ ...base, color: "#ffffff" }),
    singleValue: (base) => ({ ...base, color: "#ffffff" }),
    placeholder: (base) => ({ ...base, color: "#888" }),
  };

  return (
    <div className="flex">
      <div style={{ width: "500px" }}>
        <AsyncSelect
          styles={customStyles} // <--- APLICAMOS LOS ESTILOS AQUÍ
          cacheOptions
          defaultOptions
          loadOptions={loadOptions}
          onInputChange={(newValue) => setInputValue(newValue)}
          onChange={(option) => onSelectGym(option)} // Devuelve { value, label }
          placeholder="Escribe nombre del gym..."
          noOptionsMessage={() => "No se encontraron resultados"}
          loadingMessage={() => "Buscando..."}
        />
      </div>
    </div>
  );
};

export default GymAutocomplete;
