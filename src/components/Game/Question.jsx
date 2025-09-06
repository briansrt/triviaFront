import { useEffect, useState } from "react";

export default function Question({ question, onAnswer }) {
  const [timeLeft, setTimeLeft] = useState(question.timeLimit || 5);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (timeLeft <= 0 || answered) return;

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, answered]);

  const percentage = (timeLeft / question.timeLimit) * 100;

  const getBarColor = () => {
    if (percentage > 50) return "bg-green-500";
    if (percentage > 25) return "bg-yellow-400";
    return "bg-red-500";
  };

  const handleAnswer = (opt) => {
    if (answered) return;

    setAnswered(true);             // ✅ Bloquea más respuestas
    setSelectedOption(opt);       // ✅ Marca la elegida
    setTimeLeft(0);               // ✅ Congela la barra visual
    onAnswer(opt);                // ✅ Envía al backend ya mismo
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md">
      {/* Pregunta */}
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {question.text}
      </h2>

      {/* Opciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            disabled={answered} // ✅ Desactiva al responder
            className={`px-4 py-3 rounded-lg shadow text-center font-semibold transition-all duration-300
              ${answered && selectedOption === opt
                ? "bg-blue-400 text-white"
                : "bg-blue-100 hover:bg-blue-200 text-blue-900"}
            `}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Tiempo restante */}
      <div className="mb-2 text-sm text-gray-500 text-center">
        {answered ? "Esperando resultado..." : `Tiempo restante: ${timeLeft}s`}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
