import { useEffect, useState } from "react";
import "./App.css";

interface StoredImage {
  id: string;
  name: string;
  src: string;
}

interface Person {
  id: string;
  name: string;
  imageId: string;
  isDown: boolean;
}

const IMAGES_KEY = "whoami_images";
const PEOPLE_KEY = "whoami_people";

function App() {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [people, setPeople] = useState<Person[]>([]);

  const [personName, setPersonName] = useState("");
  const [selectedImage, setSelectedImage] = useState("");

  /* ================= CARGAR AL INICIAR ================= */
  useEffect(() => {
    const savedImages = localStorage.getItem(IMAGES_KEY);
    const savedPeople = localStorage.getItem(PEOPLE_KEY);

    if (savedImages) setImages(JSON.parse(savedImages));
    if (savedPeople) setPeople(JSON.parse(savedPeople));
  }, []);

  /* ================= GUARDAR AUTOMÁTICAMENTE ================= */
  useEffect(() => {
    localStorage.setItem(IMAGES_KEY, JSON.stringify(images));
  }, [images]);

  useEffect(() => {
    localStorage.setItem(PEOPLE_KEY, JSON.stringify(people));
  }, [people]);

  /* ================= COMPRIMIR IMAGEN ================= */
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = () => {
        img.src = reader.result as string;
      };

      img.onload = () => {
        const size = 150;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, size, size);

        resolve(canvas.toDataURL("image/jpeg", 0.6));
      };

      reader.readAsDataURL(file);
    });
  };

  /* ================= AGREGAR VARIAS IMÁGENES ================= */
  const addImages = async (files: FileList) => {
    const compressedImages: StoredImage[] = [];

    for (const file of Array.from(files)) {
      const src = await compressImage(file);
      compressedImages.push({
        id: crypto.randomUUID(),
        name: file.name,
        src,
      });
    }

    setImages((prev) => [...prev, ...compressedImages]);
  };

  /* ================= CREAR TARJETA ================= */
  const addPerson = () => {
    if (!personName.trim() || !selectedImage) return;

    setPeople((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: personName,
        imageId: selectedImage,
        isDown: false,
      },
    ]);

    setPersonName("");
    setSelectedImage("");
  };

  /* ================= GIRAR TARJETA ================= */
  const togglePerson = (id: string) => {
    setPeople((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isDown: !p.isDown } : p
      )
    );
  };

  /* ================= ELIMINAR TARJETA ================= */
  const deletePerson = (id: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));
  };

  const getImageSrc = (id: string) =>
    images.find((img) => img.id === id)?.src;

  let counter = 1;
  function hideUI(){
    let UI = document.getElementById("Ui")
    if (counter % 2 == 0) {
      if (UI) {
        UI.style.display = "none"
      }
      counter += 1;
    } else {
      if (UI) {
        UI.style.display = "contents"
      }
      counter += 1;
    }
  }

  return (
    <div className="App">
      <button onClick={hideUI}>Ocultar / Mostrar UI</button>
      <div id="Ui" className="Ui">
        <h2>Agregar Imágenes (una sola vez)</h2>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) =>
            e.target.files && addImages(e.target.files)
          }
        />

        <p>Imágenes guardadas: {images.length}</p>

        <hr />

        <h2>Crear Tarjeta</h2>

        <input
          type="text"
          placeholder="Nombre"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
        />

        <select
          value={selectedImage}
          onChange={(e) => setSelectedImage(e.target.value)}
        >
          <option value="">Seleccionar imagen</option>
          {images.map((img) => (
            <option key={img.id} value={img.id}>
              {img.name}
            </option>
          ))}
        </select>
        <button onClick={addPerson}>Agregar Tarjeta</button>
      </div>

      <hr />

      <h3>Tarjetas</h3>

      <div className="person-list">
        {
        people.map((p) => (
          <div
            key={p.id}
            className={`person-card ${p.isDown ? "active" : ""}`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                deletePerson(p.id);
              }}
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
              }}
            >
            </button>

            <div onClick={() => togglePerson(p.id)}>
              <h4>{p.name}</h4>
              <img src={getImageSrc(p.imageId)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
