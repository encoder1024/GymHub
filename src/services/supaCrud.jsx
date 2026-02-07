import { supabase } from "../supabaseClient";

export const CrudFetchOne = async (elemId, tabla, atributos) => {
  let columnas = "";

  if (Array.isArray(atributos)) {
    console.log("Es un array ✅");
    console.log("Longitud:", atributos.length);
    columnas = atributos.join(", ");
  } else {
    columnas = "*";
  }

  try {
    const { data, error } = await supabase
      .from(tabla)
      .select(columnas)
      .eq("id", elemId)
      .maybeSingle();

    if (error) throw error;
    return { error, data };
  } catch (error) {
    console.error("Error fetching one service:", error.message);
    return { error };
  }
};

export const CrudFetchAll = async (tabla) => {
  try {
    const { data, error } = await supabase.from(tabla).select("*");

    if (error) throw error;
    return { error, data };
  } catch (error) {
    console.error("Error fetching all service:", error.message);
    return { error };
  }
};

export const CrudDelete = async (elemId, tabla) => {
  if (!window.confirm("¿Estás seguro de que quieres eliminar este elemento?"))
    return;

  try {
    const { error } = await supabase.from(tabla).delete().eq("id", elemId);
    if (error) throw error;
    alert("Elemento eliminado correctamente.");
    return { error, elemId, tabla }; //setClasses(classes.filter((cls) => cls.id !== classId)); // Actualizar estado local
  } catch (error) {
    alert(`Error al eliminar: ${error.message}`);
    return { error, elemId, tabla };
  }
};

export const CrudUpdate = async (elemId, tabla, elemData, mensaje) => {
  if (!window.confirm(mensaje))
    return;

  let tieneAtributos = false;

  if (
    typeof elemData === "object" &&
    elemData !== null &&
    !Array.isArray(elemData)
  ) {
    if (Object.entries(elemData).length > 0) {
      console.log("tiene los atributos");
      tieneAtributos = true;
    }
  } else {
    tieneAtributos = false;
    throw new Error("Debe tener al menos un atributo para Update.");
  }

  if (tieneAtributos) {
    try {
      const { data: updatedElement, error } = await supabase
        .from(tabla)
        .update(elemData)
        .eq("id", elemId)
        .select();

      if (error) throw error;
      alert("Elemento actualizado correctamente!");

      // const { data: updatedElement, error: fetchError } = await supabase
      //   .from(tabla)
      //   .select("*")
      //   .eq("id", elemId);

      // if (fetchError) throw error;

      return { error, elemId, tabla, updatedElement };
    } catch (error) {
      alert(`Error al update: ${error.message}`);
      return { error, elemId, tabla };
    }
  }
};

export const CrudInsert = async (elemId, tabla, elemData) => {
  let tieneAtributos = false;

  if (
    typeof elemData === "object" &&
    elemData !== null &&
    !Array.isArray(elemData)
  ) {
    if (Object.entries(elemData).length > 0) {
      console.log("tiene los atributos");
      tieneAtributos = true;
    }
  } else {
    tieneAtributos = false;
    throw new Error("Debe tener los atributos para Insert.");
  }

  if (tieneAtributos) {
    try {
      const { error, dataIns } = await supabase
        .from(tabla)
        .insert([elemData])
        .select("id")
        .single();

      if (error) throw error;
      alert("Elemento creado correctamente!");

      const { data: updatedElement, error: fetchError } = await supabase
        .from(tabla)
        .select("*")
        .eq("id", dataIns.id);

      if (fetchError) throw error;

      return { error, elemId, tabla, updatedElement };
    } catch (error) {
      alert(`Error al insert: ${error.message}`);
      return { error, elemId, tabla };
    }
  }
};
