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

  return (
    <div className="flex">
      <div style={{ width: "500px" }}>
        <AsyncSelect
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
