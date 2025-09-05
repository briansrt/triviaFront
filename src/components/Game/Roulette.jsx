import { useEffect, useRef, useState } from "react";

const categories = ["Ciencia", "Arte", "Historia", "Geografía", "Deportes", "Tecnología"];

export default function Roulette({ selectedCategory, onFinish }) {
  const [displayedCategory, setDisplayedCategory] = useState("🎡");
  const [finalCategory, setFinalCategory] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!selectedCategory) {
      console.log("⚠️ selectedCategory no está definido. No se inicia la ruleta.");
      return;
    }

    console.log("🎯 Iniciando animación con categoría:", selectedCategory);
    
    let currentIndex = 0;
    const totalSpins = 40;       // 2s total (40 * 50ms)
    const spinInterval = 50;

    // Limpia el intervalo anterior si existía
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setDisplayedCategory(categories[currentIndex % categories.length]);
      currentIndex++;

      if (currentIndex >= totalSpins) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;

        setDisplayedCategory(selectedCategory);
        setFinalCategory(selectedCategory);

        setTimeout(() => {
          onFinish(selectedCategory);
        }, 2000);
      }
    }, spinInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedCategory, onFinish]);

  return (
    <div className="flex flex-col items-center text-black">
      <div className="w-40 h-40 rounded-full border-4 border-blue-500 flex items-center justify-center text-xl font-bold bg-white shadow-lg">
        {displayedCategory}
      </div>
      <p className="mt-4 text-xl">
        {finalCategory ? `Categoría seleccionada: ${finalCategory}` : "Girando..."}
      </p>
    </div>
  );
}
