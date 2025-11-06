import React from "react";
import { CheckCircle2 } from "lucide-react";

const Sucess = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FBEE] text-[#201E1E] px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 md:p-12 max-w-md text-center border" style={{ borderColor: "#A9CBD2" }}>
        <CheckCircle2 className="text-green-500 w-16 h-16 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-3 text-[#201E1E]">
          Pagamento Confirmado!
        </h1>
        <p className="text-gray-600 mb-6">
          Seu pagamento foi processado com sucesso. 🎉  
          Em breve, sua entrega será realizada.
        </p>

        <a
          href="/"
          className="inline-block bg-[#9AC3CD] hover:scale-105 transition-transform font-semibold text-[#201E1E] py-3 px-6 rounded-lg shadow-md"
        >
          Voltar à Página Inicial
        </a>
      </div>

      <footer className="mt-10 text-gray-500 text-sm opacity-70">
        Obrigado por comprar conosco 💙
      </footer>
    </div>
  );
};

export default Sucess;
