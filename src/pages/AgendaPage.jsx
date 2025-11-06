import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

const API_URL = 'https://backendagenda-paf6.onrender.com';

const mapDayToPortuguese = (date) => {
  const days = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado'
  ];
  return days[date.getDay()];
};

const SuccessModal = ({ message, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm mx-4 transform transition-all duration-300 scale-100" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="text-xl font-bold mb-3 text-gray-800">Agendamento Confirmado!</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={onConfirm}
            className="w-full py-2 px-4 rounded-lg font-semibold transition hover:opacity-90"
            style={{ backgroundColor: "#9AC3CD", color: "#201E1E" }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfirmationModal = ({ date, time, onConfirm, onCancel, professorName }) => {
  const [clientNameInput, setClientNameInput] = useState("");
  const professorDisplay = professorName || 'tt1';

  const handleConfirmClick = () => {
    if (clientNameInput.trim()) {
      onConfirm(clientNameInput.trim());
    } else {
      alert("O nome é obrigatório para o agendamento.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent" onClick={onCancel}>
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-lg mx-4 transform transition-all duration-300 scale-100" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">Confirmar Agendamento</h3>
        <p className="text-lg mb-2 text-gray-600">
          Professor(a): <span className="font-semibold" style={{ color: "#201E1E" }}>{professorDisplay}</span>
        </p>
        <p className="text-lg mb-4 text-gray-600">
          Data/Hora: <span className="font-semibold" style={{ color: "#201E1E" }}>{date.toLocaleDateString("pt-BR")} às {time}</span>
        </p>
        <label htmlFor="clientNameInput" className="block text-sm font-medium mb-2 text-gray-700">
          Seu Nome Completo:
        </label>
        <input
          id="clientNameInput"
          type="text"
          value={clientNameInput}
          onChange={(e) => setClientNameInput(e.target.value)}
          placeholder="Digite seu nome aqui"
          className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
          style={{ borderColor: "#A9CBD2" }}
        />
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="py-2 px-4 rounded-lg font-semibold transition hover:bg-gray-100 border border-gray-300"
            style={{ color: "#201E1E" }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmClick}
            className="py-2 px-4 rounded-lg font-semibold transition hover:opacity-90 shadow-md"
            style={{ backgroundColor: "#9AC3CD", color: "#201E1E" }}
          >
            Confirmar e Agendar
          </button>
        </div>
      </div>
    </div>
  );
};

const AgendaPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [professorData, setProfessorData] = useState(location.state?.professor || null);
  const [specialtyData, setSpecialtyData] = useState(location.state?.specialty || null);
  const professorName = professorData?.name;

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [professorSchedule, setProfessorSchedule] = useState(null);
  const [scheduleIsLoading, setScheduleIsLoading] = useState(true);

  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  useEffect(() => {
    if (!professorData || !specialtyData) {
      console.error("Dados de agendamento (professor/especialidade) não encontrados no state da rota.");
      alert("Houve um erro ao carregar a agenda. Por favor, inicie o processo de agendamento novamente.");
      navigate('/home');
    }
  }, [professorData, specialtyData, navigate]);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!professorName) {
        setProfessorSchedule([]);
        setScheduleIsLoading(false);
        return;
      }

      setScheduleIsLoading(true);

      try {
        const response = await axios.post(`${API_URL}/findConfigSchedule`, 
          { professor: professorName }, 
          { headers: { "Content-Type": "application/json" } }
        );
        setProfessorSchedule(response.data);
      } catch (err) {
        console.error("Erro ao buscar a configuração da agenda:", err.response?.data || err.message);
        setProfessorSchedule([]);
      } finally {
        setScheduleIsLoading(false);
      }
    };

    if (professorName) {
      fetchSchedule();
    }
  }, [professorName]);

  const getAvailableTimeSlots = () => {
    if (!selectedDate || !professorSchedule || professorSchedule.length === 0) {
      return [];
    }

    const portugueseDay = mapDayToPortuguese(selectedDate);
    const dayConfig = professorSchedule.find(config => config.day === portugueseDay);

    if (!dayConfig || !dayConfig.active) {
      return [];
    }

    const { start, end } = dayConfig;
    const availableSlots = [];

    const timeToMinutes = (time) => {
      const [hour, minute] = time.split(':').map(Number);
      return hour * 60 + minute;
    };

    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    const today = new Date();

    for (let currentMinutes = startMinutes; currentMinutes < endMinutes; currentMinutes += 30) {
      const hour = Math.floor(currentMinutes / 60);
      const minute = currentMinutes % 60;
      const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

      const slotDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        hour,
        minute,
        0
      );

      if (slotDate > today) {
        availableSlots.push(timeString);
      }
    }

    return availableSlots;
  };

  const timeSlots = getAvailableTimeSlots();

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime("");
    if (showSuccessModal) setShowSuccessModal(false);
    if (showConfirmationModal) setShowConfirmationModal(false);
  };

  const handleTimeClick = (time) => {
    setSelectedTime(time);
    if (selectedDate) {
      setShowConfirmationModal(true);
    }
  };

  const handleModalConfirm = (clientNameFromModal) => {
    setShowConfirmationModal(false);
    handleSubmitClient(clientNameFromModal);
  };

  const handleModalCancel = () => {
    setShowConfirmationModal(false);
  };

  const handleSuccessModalConfirm = () => {
    setShowSuccessModal(false);
    navigate('/home');
  };

  // ✅ Ajustado para enviar o corpo corretamente à rota /addAgenda
  const handleSubmitClient = async (name) => {
    const professorDisplay = professorName || 'Professor Desconhecido';
    const professor = professorName || 'Professor Desconhecido';

    try {
      const response = await axios.post(`${API_URL}/addAgenda`, 
        {
          name: name,
          professor: professor,
          date: selectedDate.toISOString().split('T')[0],
          hour: selectedTime
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (response.status === 200) {
        const message = `Sua aula com o professor(a) ${professorDisplay} foi agendada para ${selectedDate.toLocaleDateString("pt-BR")} às ${selectedTime}. Clique em OK para ser redirecionado(a).`;
        setModalMessage(message);
        setShowSuccessModal(true);
        setSelectedDate(null);
        setSelectedTime("");
      }

    } catch (err) {
      console.error("Erro no agendamento:", err);
      
      let errorMessage = "❌ Ocorreu um erro ao agendar. Tente novamente.";
      
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = "❌ Professor não encontrado. Tente novamente.";
        } else if (err.response.data?.error) {
          errorMessage = `❌ ${err.response.data.error}`;
        }
      } else if (err.request) {
        errorMessage = "❌ Servidor não respondeu. Verifique sua conexão.";
      }
      
      alert(errorMessage);
      setSelectedDate(null);
      setSelectedTime("");
    }
  };

  const formattedProfessorName = professorName || 'o Professor';

  return (
    <div className="min-h-screen flex flex-col items-center p-8" style={{ backgroundColor: "#F9FBEE" }}>
      {showConfirmationModal && selectedDate && selectedTime && (
        <ConfirmationModal
          date={selectedDate}
          time={selectedTime}
          professorName={professorName}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          message={modalMessage}
          onConfirm={handleSuccessModalConfirm}
        />
      )}

      <h1 className="text-4xl font-bold mb-4 text-center" style={{ color: "#201E1E" }}>
        Agenda de Aulas com {formattedProfessorName}
      </h1>
      <p className="text-lg mb-8 text-center max-w-lg" style={{ color: "#201E1E" }}>
        {specialtyData ? 
          `Agendando aula de ${specialtyData.typeDance}. Escolha uma data e horário disponível.` :
          "Escolha uma data e um horário disponível para agendar sua aula."
        }
      </p>

      <div className="shadow-xl rounded-2xl p-8 border w-full max-w-2xl flex flex-col items-center" style={{ backgroundColor: "#FFFFFF", borderColor: "#A9CBD2" }}>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          minDate={minDate}
          tileDisabled={({ date, view }) => {
            if (view === 'month' && professorSchedule) {
              const day = mapDayToPortuguese(date);
              const config = professorSchedule.find(c => c.day === day);
              return date < minDate || (config && !config.active);
            }
            if (view === 'month' && !professorSchedule && !scheduleIsLoading) {
              return true;
            }
            return false;
          }}
          tileClassName={({ date, view }) => {
            if (view === 'month' && professorSchedule && date >= minDate) {
              const day = mapDayToPortuguese(date);
              const config = professorSchedule.find(c => c.day === day);
              if (config && config.active) {
                return 'available-day';
              }
            }
            return null;
          }}
          prev2Label={null}
          next2Label={null}
          locale="pt-BR"
          className="!w-full !text-lg rounded-lg"
        />

        {scheduleIsLoading ? (
          <p className="mt-8 text-center text-lg font-semibold" style={{ color: "#201E1E" }}>
            Carregando agenda do professor...
          </p>
        ) : selectedDate && (
          <div className="mt-8 w-full text-center">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: "#201E1E" }}>
              {`Data selecionada: ${selectedDate.toLocaleDateString("pt-BR")}`}
            </h2>

            {timeSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 justify-center">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeClick(time)}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition ${
                      selectedTime === time ? "shadow-md" : "hover:scale-105"
                    }`}
                    style={{
                      backgroundColor: selectedTime === time ? "#9AC3CD" : "#A9CBD2",
                      color: "#201E1E",
                      borderColor: "#A9CBD2",
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-center text-base text-red-600 font-semibold">
                {professorSchedule && professorSchedule.length > 0 
                  ? 'Não há horários disponíveis para este dia.' 
                  : 'A agenda do professor não está configurada ou o dia não está ativo.'}
              </p>
            )}

            {selectedTime && (
              <div className="mt-6 text-center text-base font-semibold" style={{ color: "#201E1E" }}>
                Horário selecionado. Clique no horário para abrir a confirmação.
              </div>
            )}
          </div>
        )}
      </div>

      {!scheduleIsLoading && selectedDate && !selectedTime && timeSlots.length > 0 && (
        <div className="mt-6 text-center text-base" style={{ color: "#201E1E" }}>
          Selecione um horário disponível para continuar.
        </div>
      )}
    </div>
  );
};

export default AgendaPage;
